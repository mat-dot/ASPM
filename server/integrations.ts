import axios from "axios";

/**
 * Integrações com ferramentas de segurança
 * Semgrep (SAST) + Burp Suite (DAST)
 */

// ============ SEMGREP INTEGRATION (SAST) ============

export interface SemgrepConfig {
  apiToken: string;
  apiUrl?: string; // Default: https://api.semgrep.dev
}

export interface SemgrepFinding {
  rule_id: string;
  message: string;
  path: string;
  start: { line: number; col: number };
  end: { line: number; col: number };
  severity: "ERROR" | "WARNING" | "INFO";
  metadata?: Record<string, any>;
}

export class SemgrepClient {
  private apiToken: string;
  private apiUrl: string;

  constructor(config: SemgrepConfig) {
    this.apiToken = config.apiToken;
    this.apiUrl = config.apiUrl || "https://api.semgrep.dev";
  }

  async scanRepository(repoUrl: string, branch: string = "main"): Promise<SemgrepFinding[]> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/api/v1/scan`,
        {
          repository_url: repoUrl,
          branch: branch,
          config: "p/security-audit", // Preset de segurança
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.findings || [];
    } catch (error) {
      console.error("[Semgrep] Scan failed:", error);
      throw error;
    }
  }

  async getOrganizationFindings(): Promise<SemgrepFinding[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/v1/findings`, {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      });

      return response.data.findings || [];
    } catch (error) {
      console.error("[Semgrep] Get findings failed:", error);
      throw error;
    }
  }

  mapFindingToVulnerability(finding: SemgrepFinding) {
    const severityMap: Record<string, string> = {
      ERROR: "crítica",
      WARNING: "alta",
      INFO: "baixa",
    };

    return {
      title: finding.message,
      description: `Semgrep Rule: ${finding.rule_id}\nLocation: ${finding.path}:${finding.start.line}`,
      severity: severityMap[finding.severity] || "média",
      cweId: this.extractCWEFromMetadata(finding.metadata),
      scannerSource: "semgrep",
      remediation: this.generateRemediationTip(finding.rule_id),
    };
  }

  private extractCWEFromMetadata(metadata?: Record<string, any>): string | undefined {
    if (!metadata) return undefined;
    return metadata.cwe || metadata.cwe_id;
  }

  private generateRemediationTip(ruleId: string): string {
    const tips: Record<string, string> = {
      "python.lang.security.audit.dangerous-eval": "Avoid using eval(). Use ast.literal_eval() for safe parsing.",
      "javascript.lang.security.audit.detect-eval": "Never use eval(). Use JSON.parse() or other safe alternatives.",
      "generic.secrets.gitleaks": "Remove secrets from code. Use environment variables or secret management.",
    };
    return tips[ruleId] || "Review and fix the security issue according to best practices.";
  }
}

// ============ BURP SUITE INTEGRATION (DAST) ============

export interface BurpConfig {
  apiKey: string;
  apiUrl: string; // ex: https://your-burp-enterprise.com/api
}

export interface BurpIssue {
  issue_id: string;
  issue_name: string;
  issue_detail: string;
  severity: "High" | "Medium" | "Low" | "Information";
  confidence: "Firm" | "Tentative" | "Inferred";
  host: string;
  path: string;
  http_service: {
    protocol: string;
    host: string;
    port: number;
  };
}

export class BurpClient {
  private apiKey: string;
  private apiUrl: string;

  constructor(config: BurpConfig) {
    this.apiKey = config.apiKey;
    this.apiUrl = config.apiUrl;
  }

  async scanUrl(targetUrl: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/v1/scans`,
        {
          scope: {
            include: [
              {
                url: targetUrl,
              },
            ],
          },
          scan_configurations: ["full audit"],
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.scan_id;
    } catch (error) {
      console.error("[Burp] Scan initiation failed:", error);
      throw error;
    }
  }

  async getScanStatus(scanId: string): Promise<{ status: string; progress: number }> {
    try {
      const response = await axios.get(`${this.apiUrl}/v1/scans/${scanId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return {
        status: response.data.scan_status,
        progress: response.data.scan_progress || 0,
      };
    } catch (error) {
      console.error("[Burp] Get scan status failed:", error);
      throw error;
    }
  }

  async getScanIssues(scanId: string): Promise<BurpIssue[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/v1/scans/${scanId}/issues`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return response.data.issues || [];
    } catch (error) {
      console.error("[Burp] Get scan issues failed:", error);
      throw error;
    }
  }

  mapIssueToVulnerability(issue: BurpIssue) {
    const severityMap: Record<string, string> = {
      High: "crítica",
      Medium: "alta",
      Low: "média",
      Information: "baixa",
    };

    return {
      title: issue.issue_name,
      description: issue.issue_detail,
      severity: severityMap[issue.severity] || "média",
      scannerSource: "burp_suite",
      remediation: `Review and fix the issue at ${issue.http_service.protocol}://${issue.http_service.host}:${issue.http_service.port}${issue.path}`,
    };
  }
}

// ============ UNIFIED SCANNER ORCHESTRATION ============

export class ScannerOrchestrator {
  private semgrep?: SemgrepClient;
  private burp?: BurpClient;

  setSemgrepClient(client: SemgrepClient) {
    this.semgrep = client;
  }

  setBurpClient(client: BurpClient) {
    this.burp = client;
  }

  async runFullScan(
    repoUrl: string,
    targetUrl: string,
    branch: string = "main"
  ): Promise<{
    sast: any[];
    dast: any[];
    combined: any[];
  }> {
    const results: any = {
      sast: [],
      dast: [],
      combined: [],
    };

    // Run SAST (Semgrep)
    if (this.semgrep) {
      try {
        const sastFindings = await this.semgrep.scanRepository(repoUrl, branch);
        results.sast = sastFindings.map((f) => this.semgrep!.mapFindingToVulnerability(f));
      } catch (error) {
        console.error("[Orchestrator] SAST scan failed:", error);
      }
    }

    // Run DAST (Burp Suite)
    if (this.burp) {
      try {
        const scanId = await this.burp.scanUrl(targetUrl);
        // In production, would wait for scan completion
        const dastIssues = await this.burp.getScanIssues(scanId);
        results.dast = dastIssues.map((i) => this.burp!.mapIssueToVulnerability(i));
      } catch (error) {
        console.error("[Orchestrator] DAST scan failed:", error);
      }
    }

    // Combine and deduplicate
    results.combined = this.deduplicateFindings([...results.sast, ...results.dast]);

    return results;
  }

  private deduplicateFindings(findings: any[]): any[] {
    const seen = new Set<string>();
    return findings.filter((f) => {
      const key = `${f.title}:${f.severity}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

// ============ MOCK IMPLEMENTATIONS FOR TESTING ============

export class MockSemgrepClient extends SemgrepClient {
  async scanRepository(): Promise<SemgrepFinding[]> {
    return [
      {
        rule_id: "python.lang.security.audit.dangerous-eval",
        message: "Dangerous use of eval()",
        path: "app/utils.py",
        start: { line: 42, col: 5 },
        end: { line: 42, col: 20 },
        severity: "ERROR",
        metadata: { cwe: "CWE-95" },
      },
      {
        rule_id: "generic.secrets.gitleaks",
        message: "Potential API key detected",
        path: "config/settings.py",
        start: { line: 10, col: 15 },
        end: { line: 10, col: 50 },
        severity: "ERROR",
        metadata: { cwe: "CWE-798" },
      },
    ];
  }
}

export class MockBurpClient extends BurpClient {
  async scanUrl(): Promise<string> {
    return "mock-scan-id-12345";
  }

  async getScanIssues(): Promise<BurpIssue[]> {
    return [
      {
        issue_id: "1",
        issue_name: "SQL Injection",
        issue_detail: "SQL injection vulnerability found in search parameter",
        severity: "High",
        confidence: "Firm",
        host: "api.example.com",
        path: "/api/search",
        http_service: {
          protocol: "https",
          host: "api.example.com",
          port: 443,
        },
      },
      {
        issue_id: "2",
        issue_name: "Cross-site scripting (XSS)",
        issue_detail: "Reflected XSS in user input field",
        severity: "Medium",
        confidence: "Firm",
        host: "app.example.com",
        path: "/profile",
        http_service: {
          protocol: "https",
          host: "app.example.com",
          port: 443,
        },
      },
    ];
  }
}
