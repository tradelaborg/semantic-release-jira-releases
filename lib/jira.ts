const axios = require('axios');
import { PluginConfig, PluginContext } from './types';

export class JiraClient {
  private baseUrl: string;
  private auth: string;

  constructor(config: PluginConfig, context: PluginContext) {
    this.baseUrl = `https://${config.jiraHost}/rest/api/3`;
    this.auth = context.env.JIRA_AUTH;
  }

  private getHeaders() {
    return {
      'Authorization': `Basic ${this.auth}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }

  async getProject(projectIdOrKey: string) {
    const response = await axios.get(`${this.baseUrl}/project/${projectIdOrKey}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async getVersions(projectIdOrKey: string) {
    const response = await axios.get(`${this.baseUrl}/project/${projectIdOrKey}/versions`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async createVersion(data: {
    name: string;
    projectId: string;
    description?: string;
    released?: boolean;
    releaseDate?: string;
  }) {
    const response = await axios.post(`${this.baseUrl}/version`, data, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async updateIssue(issueKey: string, data: {
    update: {
      fixVersions: Array<{
        add: { id: string };
      }>;
    };
  }) {
    const response = await axios.put(`${this.baseUrl}/issue/${issueKey}`, data, {
      headers: this.getHeaders()
    });
    return response.data;
  }
}

export function makeClient(config: PluginConfig, context: PluginContext): JiraClient {
  return new JiraClient(config, context);
}
