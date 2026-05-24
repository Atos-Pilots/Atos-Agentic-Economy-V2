export interface SecurityMetadata {
    did: string; // Decentralized Identifier
    endpoint_url: string;
    public_key?: string;
}

export interface TrustPolicy {
    requires_sca: boolean;
    allowed_rails: string[];
    max_transaction_value?: number;
}

export interface CapabilityCard {
    agent_id: string;
    agent_name: string;
    description: string;
    security_metadata: SecurityMetadata;
    exposed_capabilities: string[]; // e.g., ['payment.execution', 'search.product', 'quote.request']
    protocol_versions: string[];    // e.g., ['1.0.0', '1.1.0']
    trust_policies: TrustPolicy;
    status: 'ACTIVE' | 'INACTIVE' | 'REVOKED';
}

export class AgentRegistry {
    // In-memory registry for Lot 1. Can be migrated to DB/Prisma in Lot 2.
    private registry: Map<string, CapabilityCard> = new Map();

    /**
     * Registers a new agent capability card or updates an existing one
     */
    public registerAgent(card: CapabilityCard): void {
        this.registry.set(card.agent_id, card);
        console.log(`[AgentRegistry] Registered Capability Card for ${card.agent_name} (${card.agent_id})`);
    }

    /**
     * Retrieves an agent's capability card
     */
    public getAgent(agentId: string): CapabilityCard | undefined {
        return this.registry.get(agentId);
    }

    /**
     * Discovers agents by requested capability
     */
    public discoverByCapability(capability: string): CapabilityCard[] {
        const found: CapabilityCard[] = [];
        for (const card of this.registry.values()) {
            if (card.status === 'ACTIVE' && card.exposed_capabilities.includes(capability)) {
                found.push(card);
            }
        }
        return found;
    }

    /**
     * Revokes an agent from the ecosystem
     */
    public revokeAgent(agentId: string): void {
        const card = this.registry.get(agentId);
        if (card) {
            card.status = 'REVOKED';
            this.registry.set(agentId, card);
            console.log(`[AgentRegistry] Agent ${agentId} has been explicitly REVOKED from ecosystem.`);
        }
    }
}

export const agentRegistry = new AgentRegistry();
