"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyConditions = void 0;
const tslib_1 = require("tslib");
const error_1 = tslib_1.__importDefault(require("@semantic-release/error"));
const jira_1 = require("./jira");
async function verifyConditions(config, context) {
    const { networkConcurrency } = config;
    if (typeof config.jiraHost !== 'string') {
        throw new error_1.default(`config.jiraHost must be a string`, 'EINVALIDJIRAHOST');
    }
    if (typeof config.projectId !== 'string') {
        throw new error_1.default(`config.projectId must be a string`, 'EINVALIDPROJECTID');
    }
    if (!config.ticketPrefixes && !config.ticketRegex) {
        throw new error_1.default('Either config.ticketPrefixes or config.ticketRegex must be passed', 'EMISSINGTICKETCONFIG');
    }
    if (config.ticketPrefixes && config.ticketRegex) {
        throw new error_1.default(`config.ticketPrefixes and config.ticketRegex cannot be passed at the same time`, 'ECONFLICTTICKETCONFIG');
    }
    if (config.ticketPrefixes) {
        if (!Array.isArray(config.ticketPrefixes)) {
            throw new error_1.default(`config.ticketPrefixes must be an array of string`, 'EINVALIDTICKETPREFIXES');
        }
        for (const prefix of config.ticketPrefixes) {
            if (typeof prefix !== 'string') {
                throw new error_1.default(`config.ticketPrefixes must be an array of string`, 'EINVALIDTICKETPREFIXES');
            }
        }
    }
    if (config.ticketRegex && typeof config.ticketRegex !== 'string') {
        throw new error_1.default(`config.ticketRegex must be an string`, 'EINVALIDTICKETREGEX');
    }
    if (config.releaseNameTemplate) {
        if (typeof config.releaseNameTemplate !== 'string' || config.releaseNameTemplate.indexOf('${version}') === -1) {
            throw new error_1.default('config.releaseNameTemplate must be a string containing ${version}', 'EINVALIDRELEASENAMETEMPLATE');
        }
    }
    if (config.releaseDescriptionTemplate !== null && config.releaseDescriptionTemplate !== undefined) {
        if (typeof config.releaseDescriptionTemplate !== 'string') {
            throw new error_1.default('config.releaseDescriptionTemplate must be a string', 'EINVALIDRELEASEDESCTEMPLATE');
        }
    }
    if (networkConcurrency && (typeof networkConcurrency !== 'number' || networkConcurrency < 1)) {
        throw new error_1.default(`config.networkConcurrency must be an number greater than 0`, 'EINVALIDNETWORKCONCURRENCY');
    }
    if (!context.env.JIRA_AUTH) {
        throw new error_1.default(`JIRA_AUTH must be a string`, 'EMISSINGJIRAAUTH');
    }
    const jira = (0, jira_1.makeClient)(config, context);
    await jira.project.getProject({ projectIdOrKey: config.projectId });
}
exports.verifyConditions = verifyConditions;
//# sourceMappingURL=verifyConditions.js.map