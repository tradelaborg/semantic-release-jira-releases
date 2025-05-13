"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.success = exports.getTickets = void 0;
const tslib_1 = require("tslib");
const _ = tslib_1.__importStar(require("lodash"));
const p_limit_1 = tslib_1.__importDefault(require("p-limit"));
const axios_1 = require("axios");
const jira_1 = require("./jira");
const types_1 = require("./types");
const util_1 = require("./util");
function getTickets(config, context) {
    let patterns = [];
    if (config.ticketRegex !== undefined) {
        patterns = [new RegExp(config.ticketRegex, 'giu')];
    }
    else {
        patterns = config.ticketPrefixes
            .map(prefix => new RegExp(`\\b${(0, util_1.escapeRegExp)(prefix)}-(\\d+)\\b`, 'giu'));
    }
    const tickets = new Set();
    for (const commit of context.commits) {
        for (const pattern of patterns) {
            const matches = commit.message.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    tickets.add(match);
                    context.logger.info(`Found ticket ${matches} in commit: ${commit.commit.short}`);
                });
            }
        }
    }
    return [...tickets];
}
exports.getTickets = getTickets;
async function findOrCreateVersion(config, context, jira, projectIdOrKey, name, description) {
    const remoteVersions = await jira.getVersions(projectIdOrKey);
    context.logger.info(`Looking for version with name '${name}'`);
    const existing = _.find(remoteVersions, { name });
    if (existing) {
        context.logger.info(`Found existing release '${existing.id}'`);
        return existing;
    }
    context.logger.info(`No existing release found, creating new`);
    let newVersion;
    if (config.dryRun) {
        context.logger.info(`dry-run: making a fake release`);
        newVersion = {
            name,
            id: 'dry_run_id',
        };
    }
    else {
        const descriptionText = description || '';
        newVersion = await jira.createVersion({
            name,
            projectId: projectIdOrKey,
            description: descriptionText,
            released: Boolean(config.released),
            releaseDate: config.setReleaseDate ? (new Date().toISOString()) : undefined,
        });
    }
    context.logger.info(`Made new release '${newVersion.id}'`);
    return newVersion;
}
async function editIssueFixVersions(config, context, jira, newVersionName, releaseVersionId, issueKey) {
    var _a;
    try {
        context.logger.info(`Adding issue ${issueKey} to '${newVersionName}'`);
        if (!config.dryRun) {
            await jira.updateIssue(issueKey, {
                update: {
                    fixVersions: [{
                            add: { id: releaseVersionId },
                        }],
                },
            });
        }
    }
    catch (err) {
        const allowedStatusCodes = [400, 404];
        const statusCode = err instanceof axios_1.AxiosError ? (_a = err.response) === null || _a === void 0 ? void 0 : _a.status : undefined;
        if (statusCode === undefined || allowedStatusCodes.indexOf(statusCode) === -1) {
            throw err;
        }
        context.logger.error(`Unable to update issue ${issueKey} statusCode: ${statusCode}`);
    }
}
async function success(config, context) {
    var _a, _b;
    const tickets = getTickets(config, context);
    context.logger.info(`Found ticket ${tickets.join(', ')}`);
    const versionTemplate = _.template((_a = config.releaseNameTemplate) !== null && _a !== void 0 ? _a : types_1.DEFAULT_VERSION_TEMPLATE);
    const newVersionName = versionTemplate({ version: context.nextRelease.version });
    const descriptionTemplate = _.template((_b = config.releaseDescriptionTemplate) !== null && _b !== void 0 ? _b : types_1.DEFAULT_RELEASE_DESCRIPTION_TEMPLATE);
    const newVersionDescription = descriptionTemplate({ version: context.nextRelease.version, notes: context.nextRelease.notes });
    context.logger.info(`Using jira release '${newVersionName}'`);
    const jira = (0, jira_1.makeClient)(config, context);
    const project = await jira.project.getProject({ projectIdOrKey: config.projectId });
    const releaseVersion = await findOrCreateVersion(config, context, jira, project.id, newVersionName, newVersionDescription);
    const concurrentLimit = (0, p_limit_1.default)(config.networkConcurrency || 10);
    const edits = tickets.map(issueKey => concurrentLimit(() => editIssueFixVersions(config, context, jira, newVersionName, releaseVersion.id, issueKey)));
    await Promise.all(edits);
}
exports.success = success;
//# sourceMappingURL=success.js.map