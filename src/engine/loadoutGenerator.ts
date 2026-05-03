import weaponsData from '../data/weapons.json';
import perksData from '../data/perks.json';
import scorestreaksData from '../data/scorestreaks.json';
import wildcardsData from '../data/wildcards.json';
import { PlayMode, Weapon, Perk, Scorestreak, Wildcard, GeneratedLoadout, LoadoutAttachment, ModeWeights } from '../types';

const modeConfigs: Record<PlayMode, ModeWeights> = {
  rush: {
    priority_stats: ['mobility', 'ads_speed', 'sprint_to_fire'],
    weapon_categories: ['smgs', 'assault_rifles'],
    tier_preference: 'S',
    attachment_focus: {
      muzzle: 0.7,
      barrel: 0.9,
      optic: 0.6,
      underbarrel: 0.5,
      magazine: 0.8,
      stock: 1.0,
    },
  },
  aggro: {
    priority_stats: ['range', 'accuracy', 'control', 'damage'],
    weapon_categories: ['assault_rifles', 'lmgs', 'marksman_rifles'],
    tier_preference: 'S',
    attachment_focus: {
      muzzle: 0.9,
      barrel: 1.0,
      optic: 0.8,
      underbarrel: 0.9,
      magazine: 0.6,
      stock: 0.5,
    },
  },
  stealth: {
    priority_stats: ['suppressor', 'ads_speed', 'mobility'],
    weapon_categories: ['smgs', 'assault_rifles', 'marksman_rifles'],
    tier_preference: 'A',
    attachment_focus: {
      muzzle: 1.0,
      barrel: 0.6,
      optic: 0.5,
      underbarrel: 0.4,
      magazine: 0.5,
      stock: 0.7,
    },
  },
  tactical: {
    priority_stats: ['accuracy', 'control', 'range', 'damage'],
    weapon_categories: ['assault_rifles', 'lmgs', 'sniper_rifles'],
    tier_preference: 'A',
    attachment_focus: {
      muzzle: 0.8,
      barrel: 0.9,
      optic: 1.0,
      underbarrel: 0.9,
      magazine: 0.6,
      stock: 0.7,
    },
  },
};

export function getAllWeapons(): Weapon[] {
  const all: Weapon[] = [];
  Object.values(weaponsData).forEach((category) => {
    all.push(...(category as Weapon[]));
  });
  return all.sort((a, b) => {
    const tierOrder = { 'S': 0, 'A': 1, 'B': 2, 'C': 3 };
    return tierOrder[a.tier] - tierOrder[b.tier];
  });
}

function filterWeaponsByMode(mode: PlayMode): Weapon[] {
  const config = modeConfigs[mode];
  const allWeapons = getAllWeapons();
  
  // Filter by weapon categories for this mode
  const categoryWeapons: Weapon[] = [];
  config.weapon_categories.forEach((cat) => {
    const category = (weaponsData as unknown as Record<string, Weapon[]>)[cat];
    if (category) {
      categoryWeapons.push(...category);
    }
  });
  
  // If no weapons found in preferred categories, use all
  const pool = categoryWeapons.length > 0 ? categoryWeapons : allWeapons;
  
  // Sort by tier preference
  const tierOrder = config.tier_preference === 'S' 
    ? ['S', 'A', 'B'] 
    : ['A', 'S', 'B'];
  
  return pool.sort((a, b) => {
    const aIndex = tierOrder.indexOf(a.tier);
    const bIndex = tierOrder.indexOf(b.tier);
    return aIndex - bIndex;
  });
}

function selectRandomWeapon(weapons: Weapon[]): Weapon {
  // Weighted random - higher tier weapons have better chance
  const weights = weapons.map((w) => {
    if (w.tier === 'S') return 3;
    if (w.tier === 'A') return 2;
    return 1;
  });
  
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < weapons.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return weapons[i];
    }
  }
  
  return weapons[0];
}

function selectAttachmentsForMode(weapon: Weapon, mode: PlayMode, maxCount = 5): LoadoutAttachment[] {
  const config = modeConfigs[mode];
  const selected: LoadoutAttachment[] = [];

  // Always prioritize based on mode
  const slotPriority = Object.entries(config.attachment_focus)
    .sort(([, a], [, b]) => b - a)
    .map(([slot]) => slot);

  let count = 0;
  for (const slot of slotPriority) {
    if (count >= maxCount) break;
    
    const attachments = weapon.attachments[slot as keyof typeof weapon.attachments];
    if (!attachments || attachments.length === 0) continue;
    
    // For stealth mode, prioritize suppressors
    if (mode === 'stealth' && slot === 'muzzle') {
      const suppressor = attachments.find(a => 
        a.name.toLowerCase().includes('suppressor') || 
        a.name.toLowerCase().includes('silencer')
      );
      if (suppressor) {
        selected.push({ slot, name: suppressor.name, stats: suppressor.stats as Record<string, number | undefined> });
        count++;
        continue;
      }
    }
    
    // For rush mode, prioritize mobility attachments
    if (mode === 'rush' && (slot === 'stock' || slot === 'barrel')) {
      const mobilityAttachment = attachments.find(a => 
        (a.stats.mobility && a.stats.mobility > 0) || (a.stats.ads_speed && a.stats.ads_speed > 0)
      );
      if (mobilityAttachment) {
        selected.push({ slot, name: mobilityAttachment.name, stats: mobilityAttachment.stats as Record<string, number | undefined> });
        count++;
        continue;
      }
    }
    
    // For aggro mode, prioritize range and control
    if (mode === 'aggro' && (slot === 'barrel' || slot === 'underbarrel')) {
      const rangeAttachment = attachments.find(a => 
        (a.stats.range && a.stats.range > 0) || (a.stats.control && a.stats.control > 0)
      );
      if (rangeAttachment) {
        selected.push({ slot, name: rangeAttachment.name, stats: rangeAttachment.stats as Record<string, number | undefined> });
        count++;
        continue;
      }
    }
    
    // Random selection from available
    const randomAttachment = attachments[Math.floor(Math.random() * attachments.length)];
    selected.push({ slot, name: randomAttachment.name, stats: randomAttachment.stats as Record<string, number | undefined> });
    count++;
  }
  
  return selected;
}

function selectSecondaryWeapon(mode: PlayMode): Weapon {
  const pistols = (weaponsData as unknown as Record<string, Weapon[]>)['pistols'] || [];

  // Stealth and tactical prefer A-tier (MW11 has suppressors); rush/aggro prefer S-tier punch
  const tierOrder = (mode === 'stealth' || mode === 'tactical')
    ? ['A', 'S', 'B']
    : ['S', 'A', 'B'];

  const sorted = [...pistols].sort((a, b) =>
    tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier)
  );

  return selectRandomWeapon(sorted);
}

function selectPerksForMode(mode: PlayMode): { red: Perk; green: Perk; blue: Perk } {
  const isStealth = mode === 'stealth';
  
  // Filter perks by stealth compatibility if needed
  const redPool = isStealth 
    ? perksData.red_perks.filter(p => p.stealth_compatible || p.id === 'ghost')
    : perksData.red_perks;
  const greenPool = isStealth
    ? perksData.green_perks.filter(p => p.stealth_compatible || p.id === 'cold_blooded')
    : perksData.green_perks;
  const bluePool = isStealth
    ? perksData.blue_perks.filter(p => p.stealth_compatible || p.id === 'dead_silence')
    : perksData.blue_perks;
  
  // For specific modes, prioritize certain perks
  let red: Perk;
  let green: Perk;
  let blue: Perk;
  
  if (mode === 'rush') {
    red = perksData.red_perks.find(p => p.id === 'lightweight') || redPool[0];
    green = perksData.green_perks.find(p => p.id === 'quick_fix') || greenPool[0];
    blue = perksData.blue_perks.find(p => p.id === 'dead_silence') || bluePool[0];
  } else if (mode === 'aggro') {
    red = perksData.red_perks.find(p => p.id === 'flak_jacket') || redPool[0];
    green = perksData.green_perks.find(p => p.id === 'toughness') || greenPool[0];
    blue = perksData.blue_perks.find(p => p.id === 'demo_expert') || bluePool[0];
  } else if (mode === 'stealth') {
    red = perksData.red_perks.find(p => p.id === 'ghost') || redPool[0];
    green = perksData.green_perks.find(p => p.id === 'cold_blooded') || greenPool[0];
    blue = perksData.blue_perks.find(p => p.id === 'dead_silence') || bluePool[0];
  } else {
    // Tactical
    red = perksData.red_perks.find(p => p.id === 'persistent') || redPool[0];
    green = perksData.green_perks.find(p => p.id === 'toughness') || greenPool[0];
    blue = perksData.blue_perks.find(p => p.id === 'engineer') || bluePool[0];
  }
  
  // Fill in random if not found
  if (!red) red = perksData.red_perks[Math.floor(Math.random() * perksData.red_perks.length)];
  if (!green) green = perksData.green_perks[Math.floor(Math.random() * perksData.green_perks.length)];
  if (!blue) blue = perksData.blue_perks[Math.floor(Math.random() * perksData.blue_perks.length)];
  
  return { red, green, blue };
}

function selectScorestreaksForMode(mode: PlayMode): Scorestreak[] {
  const isStealth = mode === 'stealth';
  
  // Filter scorestreaks
  let pool = isStealth
    ? scorestreaksData.scorestreaks.filter(s => s.stealth_compatible)
    : scorestreaksData.scorestreaks;
  
  // Select 3 scorestreaks with varied costs
  const selected: Scorestreak[] = [];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  
  // Try to get a mix of low, medium, and high cost
  const lowCost = shuffled.find(s => s.cost <= 600);
  const midCost = shuffled.find(s => s.cost > 600 && s.cost <= 1000);
  const highCost = shuffled.find(s => s.cost > 1000);
  
  if (lowCost) selected.push(lowCost);
  if (midCost) selected.push(midCost);
  if (highCost) selected.push(highCost);
  
  // Fill remaining with random selections
  while (selected.length < 3 && shuffled.length > 0) {
    const streak = shuffled.pop();
    if (streak && !selected.find(s => s.id === streak.id)) {
      selected.push(streak);
    }
  }
  
  return selected.slice(0, 3);
}

export function generateLoadout(mode: PlayMode, weaponId?: string): GeneratedLoadout {
  let weapon: Weapon;
  
  if (weaponId) {
    // Use selected weapon
    const allWeapons = getAllWeapons();
    weapon = allWeapons.find(w => w.id === weaponId) || selectRandomWeapon(filterWeaponsByMode(mode));
  } else {
    // 1. Select weapon pool based on mode
    const weaponPool = filterWeaponsByMode(mode);
    // 2. Select weapon
    weapon = selectRandomWeapon(weaponPool);
  }
  
  // 3. Select attachments
  const attachments = selectAttachmentsForMode(weapon, mode);

  // 4. Select secondary weapon (pistol) with up to 3 attachments
  const secondary = selectSecondaryWeapon(mode);
  const secondaryAttachments = selectAttachmentsForMode(secondary, mode, 3);

  // 5. Select perks
  const perks = selectPerksForMode(mode);

  // 6. Select scorestreaks
  const scorestreaks = selectScorestreaksForMode(mode);

  // 7. Select wildcard
  const wildcard = selectWildcardForMode(mode);

  return {
    weapon,
    attachments,
    secondary,
    secondaryAttachments,
    perks,
    wildcard,
    scorestreaks,
    mode,
    generatedAt: new Date().toISOString(),
  };
}

function selectWildcardForMode(mode: PlayMode): Wildcard {
  // Select wildcard based on mode synergy
  const wildcards = wildcardsData.wildcards;
  
  // Mode-specific wildcard preferences
  const modeWildcards: Record<PlayMode, string[]> = {
    rush: ['gunsmith', 'perk_1_greed', 'secondary_gunner'],
    aggro: ['gunsmith', 'perk_2_greed', 'overkill'],
    stealth: ['perk_3_greed', 'law_breaker', 'tactician'],
    tactical: ['gunsmith', 'perk_2_greed', 'law_breaker'],
  };
  
  // Try to find a mode-appropriate wildcard
  const preferredIds = modeWildcards[mode];
  const preferred = wildcards.find(w => preferredIds.includes(w.id));
  
  if (preferred) {
    return preferred;
  }
  
  // Fallback to random
  return wildcards[Math.floor(Math.random() * wildcards.length)];
}

export function formatLoadoutForExport(loadout: GeneratedLoadout): string {
  const lines = [
    `=== CODM LOADOUT [${loadout.mode.toUpperCase()}] ===`,
    ``,
    `PRIMARY: ${loadout.weapon.name} (${loadout.weapon.tier}-Tier)`,
    `ATTACHMENTS:`,
    ...loadout.attachments.map(a => `  - ${a.slot.toUpperCase()}: ${a.name}`),
    ``,
    `SECONDARY: ${loadout.secondary.name} (${loadout.secondary.tier}-Tier)`,
    `ATTACHMENTS:`,
    ...loadout.secondaryAttachments.map(a => `  - ${a.slot.toUpperCase()}: ${a.name}`),
    ``,
    `WILDCARD: ${loadout.wildcard.name}`,
    `  > ${loadout.wildcard.description}`,
    ``,
    `PERKS:`,
    `  - Red: ${loadout.perks.red.name}`,
    `  - Green: ${loadout.perks.green.name}`,
    `  - Blue: ${loadout.perks.blue.name}`,
    ``,
    `SCORESTREAKS:`,
    ...loadout.scorestreaks.map(s => `  - ${s.name} (${s.cost} pts)`),
    ``,
    `Generated by CODM Loadout Strategist`,
  ];
  
  return lines.join('\n');
}
