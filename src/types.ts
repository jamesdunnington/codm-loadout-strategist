export type PlayMode = 'rush' | 'aggro' | 'stealth' | 'tactical';

export interface ElectronAPI {
  copyToClipboard: (text: string) => Promise<boolean>;
}

export interface Attachment {
  name: string;
  stats: Record<string, number>;
}

export interface Weapon {
  id: string;
  name: string;
  tier: 'S' | 'A' | 'B' | 'C';
  base_stats: {
    damage: number;
    range: number;
    mobility: number;
    accuracy: number;
    fire_rate: number;
    control: number;
  };
  attachments: {
    muzzle: Attachment[];
    barrel: Attachment[];
    optic: Attachment[];
    underbarrel: Attachment[];
    magazine: Attachment[];
    stock: Attachment[];
  };
}

export interface Perk {
  id: string;
  name: string;
  description: string;
  category: string;
  stealth_compatible: boolean;
}

export interface Scorestreak {
  id: string;
  name: string;
  cost: number;
  category: string;
  stealth_compatible: boolean;
}

export interface LoadoutAttachment {
  slot: string;
  name: string;
  stats: Record<string, number | undefined>;
}

export interface Wildcard {
  id: string;
  name: string;
  description: string;
  effect: string;
}

export interface GeneratedLoadout {
  weapon: Weapon;
  attachments: LoadoutAttachment[];
  secondary: Weapon;
  secondaryAttachments: LoadoutAttachment[];
  perks: {
    red: Perk;
    green: Perk;
    blue: Perk;
  };
  wildcard: Wildcard;
  scorestreaks: Scorestreak[];
  mode: PlayMode;
  generatedAt: string;
}

export interface ModeWeights {
  priority_stats: string[];
  weapon_categories: string[];
  tier_preference: 'S' | 'A' | 'B' | 'any';
  attachment_focus: Record<string, number>;
}
