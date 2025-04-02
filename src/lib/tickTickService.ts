export interface TaskItem {
    id: string;
    status: number;
    title: string;
    sortOrder: number;
    startDate?: string;
    isAllDay: boolean;
    timeZone?: string;
    completedTime?: string;
}

export interface Task {
    id: string;
    projectId: string;
    title: string;
    content?: string;
    desc?: string;
    isAllDay: boolean;
    timeZone?: string;
    repeatFlag?: string;
    startDate?: string;
    dueDate?: string;
    reminders?: string[];
    priority: number;
    status: number;
    completedTime?: string;
    sortOrder: number;
    items?: TaskItem[];
}

class TickTickService {
    private accessToken: string | null = null;
    private clientId: string | null = null;
    private clientSecret: string | null = null;

    constructor() {
        this.accessToken = localStorage.getItem('ticktick_access_token');
        this.clientId = localStorage.getItem('ticktick_client_id');
        this.clientSecret = localStorage.getItem('ticktick_client_secret');
        
        // Try to authenticate if we have credentials
        if (this.clientId && this.clientSecret) {
            this.authenticate().catch(console.error);
        }
    }

    isAuthenticated(): boolean {
        return !!this.accessToken;
    }

    async ensureAuthenticated(): Promise<void> {
        if (!this.isAuthenticated() && this.clientId && this.clientSecret) {
            await this.authenticate();
        }
    }

    setClientCredentials(clientId: string, clientSecret: string) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        localStorage.setItem('ticktick_client_id', clientId);
        localStorage.setItem('ticktick_client_secret', clientSecret);
        this.authenticate();
    }

    private async authenticate(): Promise<void> {
        if (!this.clientId || !this.clientSecret) {
            throw new Error('Client credentials not set');
        }

        try {
            const response = await fetch('/api/ticktick/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body: new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    scope: 'tasks:read tasks:write'
                }).toString()
            });

            if (!response.ok) {
                throw new Error(`Authentication failed: ${response.statusText}`);
            }

            const data = await response.json();
            this.accessToken = data.access_token;
            localStorage.setItem('ticktick_access_token', data.access_token);
        } catch (e) {
            console.error('Failed to authenticate:', e);
            throw e;
        }
    }

    async getTasks(projectId: string): Promise<Task[]> {
        await this.ensureAuthenticated();

        try {
            const response = await fetch(`/api/ticktick/project/${projectId}/tasks`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const text = await response.text();
            if (!text) {
                return [];
            }

            try {
                const data = JSON.parse(text);
                return Array.isArray(data) ? data : [data];
            } catch (e) {
                console.error('JSON Parse Error:', e, 'Response:', text);
                throw new Error('Invalid JSON response from server');
            }
        } catch (e) {
            console.error('Failed to fetch tasks:', e);
            throw new Error(e instanceof Error ? e.message : 'Failed to fetch tasks');
        }
    }

    async getTask(projectId: string, taskId: string): Promise<Task> {
        await this.ensureAuthenticated();

        try {
            const response = await fetch(`/api/ticktick/project/${projectId}/task/${taskId}`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (e) {
            console.error('Failed to fetch task:', e);
            throw new Error(e instanceof Error ? e.message : 'Failed to fetch task');
        }
    }
}

export const tickTickService = new TickTickService();
