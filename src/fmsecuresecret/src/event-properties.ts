export class EventProperties {
    secretName: string;
    secretValue: string;
    description: string;
    tags: Record<string, string>;
    
    constructor(secretName: string, secretValue: string, description: string, tags: Record<string, string>) {
        this.secretName = secretName;
        this.secretValue = secretValue;
        this.description = description;
        this.tags = tags;
    }
}