declare module 'jira-client' {
  export interface JiraClient {
    project: {
      getProject(params: { projectIdOrKey: string }): Promise<any>;
    };
  }
}

declare module './jira' {
  import { JiraClient } from 'jira-client';
  export function makeClient(config: any, context: any): JiraClient;
} 