"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeClient = exports.JiraClient = void 0;
const axios = require('axios');
class JiraClient {
    constructor(config, context) {
        this.project = {
            getProject: async (params) => {
                const response = await axios.get(`${this.baseUrl}/project/${params.projectIdOrKey}`, {
                    headers: this.getHeaders()
                });
                return response.data;
            }
        };
        this.baseUrl = `https://${config.jiraHost}/rest/api/3`;
        this.auth = context.env.JIRA_AUTH;
    }
    getHeaders() {
        return {
            'Authorization': `Basic ${this.auth}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
    }
    async getVersions(projectIdOrKey) {
        const response = await axios.get(`${this.baseUrl}/project/${projectIdOrKey}/versions`, {
            headers: this.getHeaders()
        });
        return response.data;
    }
    async createVersion(data) {
        const response = await axios.post(`${this.baseUrl}/version`, data, {
            headers: this.getHeaders()
        });
        return response.data;
    }
    async updateIssue(issueKey, data) {
        const response = await axios.put(`${this.baseUrl}/issue/${issueKey}`, data, {
            headers: this.getHeaders()
        });
        return response.data;
    }
}
exports.JiraClient = JiraClient;
function makeClient(config, context) {
    return new JiraClient(config, context);
}
exports.makeClient = makeClient;
//# sourceMappingURL=jira.js.map