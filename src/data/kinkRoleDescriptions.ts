// src/data/kinkRoleDescriptions.ts
// Descriptions and information links for each BDSM/Kink role

export interface RoleInfo {
  name: string;
  description: string;
  detailsUrl: string;
}

export const KINK_ROLE_INFO: Record<string, RoleInfo> = {
  Dominant: {
    name: "Dominant",
    description: "Takes control and leads in sexual and BDSM scenarios. Enjoys making decisions and guiding their partner's experiences.",
    detailsUrl: "https://www.bdsmwiki.info/Dominant"
  },
  Submissive: {
    name: "Submissive",
    description: "Prefers to surrender control and follow their partner's lead. Finds pleasure in serving and obeying.",
    detailsUrl: "https://www.bdsmwiki.info/Submissive"
  },
  Switch: {
    name: "Switch",
    description: "Enjoys both dominant and submissive roles at different times. Flexible and versatile in play dynamics.",
    detailsUrl: "https://www.bdsmwiki.info/Switch"
  },
  Master: {
    name: "Master/Mistress",
    description: "Seeks complete authority in a 24/7 power exchange relationship. Expects high protocol and formal submission.",
    detailsUrl: "https://www.bdsmwiki.info/Master"
  },
  Slave: {
    name: "Slave",
    description: "Desires complete submission and service in a 24/7 dynamic. Thrives on high protocol and structure.",
    detailsUrl: "https://www.bdsmwiki.info/Slave"
  },
  Owner: {
    name: "Owner",
    description: "Takes full ownership and responsibility for their partner(s). Provides structure, care, and control.",
    detailsUrl: "https://www.bdsmwiki.info/Owner"
  },
  Sadist: {
    name: "Sadist",
    description: "Derives pleasure from inflicting consensual pain or discomfort. Enjoys seeing physical and emotional reactions.",
    detailsUrl: "https://www.bdsmwiki.info/Sadism"
  },
  Masochist: {
    name: "Masochist",
    description: "Enjoys receiving consensual pain or discomfort. Finds pleasure in intensity and physical sensations.",
    detailsUrl: "https://www.bdsmwiki.info/Masochism"
  },
  Degrader: {
    name: "Degrader",
    description: "Enjoys consensually humiliating or degrading their partner verbally or physically during play.",
    detailsUrl: "https://www.bdsmwiki.info/Humiliation"
  },
  Degradee: {
    name: "Degradee",
    description: "Finds arousal in consensual humiliation and degradation. Enjoys being objectified or called degrading names.",
    detailsUrl: "https://www.bdsmwiki.info/Humiliation"
  },
  Rigger: {
    name: "Rigger",
    description: "Enjoys tying up partners using rope, restraints, or other bondage techniques. Skilled in rope artistry.",
    detailsUrl: "https://www.bdsmwiki.info/Rope_bondage"
  },
  Ropebunny: {
    name: "Rope Bunny",
    description: "Loves being tied up and restrained. Enjoys the aesthetics and sensations of rope bondage.",
    detailsUrl: "https://www.bdsmwiki.info/Rope_bondage"
  },
  DaddyMommy: {
    name: "Daddy/Mommy",
    description: "Takes on a nurturing, guiding parental role in the relationship. Provides care, structure, and guidance.",
    detailsUrl: "https://www.bdsmwiki.info/DDLG"
  },
  Little: {
    name: "Little",
    description: "Enjoys age regression and childlike activities. Seeks nurturing and care from a Daddy/Mommy figure.",
    detailsUrl: "https://www.bdsmwiki.info/DDLG"
  },
  Brat: {
    name: "Brat",
    description: "Playfully disobeys and teases their dominant to provoke reactions and funishment. Enjoys push and pull dynamics.",
    detailsUrl: "https://www.bdsmwiki.info/Brat"
  },
  BratTamer: {
    name: "Brat Tamer",
    description: "Enjoys taming bratty behavior through discipline and creative punishments. Appreciates the challenge.",
    detailsUrl: "https://www.bdsmwiki.info/Brat"
  },
  PrimalHunter: {
    name: "Primal Hunter",
    description: "Enjoys the thrill of the chase and predator/prey dynamics. Animalistic and instinct-driven in play.",
    detailsUrl: "https://www.bdsmwiki.info/Primal"
  },
  PrimalPrey: {
    name: "Primal Prey",
    description: "Enjoys being chased and caught in predator/prey scenarios. Thrives on instinctual fear and excitement.",
    detailsUrl: "https://www.bdsmwiki.info/Primal"
  },
  Pet: {
    name: "Pet",
    description: "Enjoys pet play and taking on animal characteristics. May act as a puppy, kitten, pony, or other pet.",
    detailsUrl: "https://www.bdsmwiki.info/Pet_play"
  },
  Ageplayer: {
    name: "Age Player",
    description: "Enjoys roleplaying different ages in consensual scenarios. Can be older or younger than actual age.",
    detailsUrl: "https://www.bdsmwiki.info/Age_play"
  },
  Exhibitionist: {
    name: "Exhibitionist",
    description: "Derives pleasure from being watched or displaying themselves sexually to others.",
    detailsUrl: "https://www.bdsmwiki.info/Exhibitionism"
  },
  Voyeur: {
    name: "Voyeur",
    description: "Enjoys watching others in intimate or sexual situations. Finds arousal in observation.",
    detailsUrl: "https://www.bdsmwiki.info/Voyeurism"
  },
  Experimentalist: {
    name: "Experimentalist",
    description: "Open to trying new things and exploring various kinks. Curious and adventurous in their sexuality.",
    detailsUrl: "https://www.bdsmwiki.info/BDSM"
  },
  Nonmonogamist: {
    name: "Non-monogamist",
    description: "Interested in relationships with multiple partners. May include polyamory, open relationships, or swinging.",
    detailsUrl: "https://www.bdsmwiki.info/Polyamory"
  },
  Vanilla: {
    name: "Vanilla",
    description: "Prefers conventional sexual activities without BDSM or kink elements. Values traditional intimacy.",
    detailsUrl: "https://www.bdsmwiki.info/Vanilla"
  },
  MasterMistress: {
    name: "Master/Mistress",
    description: "Seeks complete authority in a 24/7 power exchange relationship. Expects high protocol and formal submission.",
    detailsUrl: "https://www.bdsmwiki.info/Master"
  }
};

// Helper function to get role info with fallback
export function getRoleInfo(roleName: string): RoleInfo {
  const cleanName = roleName.replace(/\s+/g, '');
  return KINK_ROLE_INFO[cleanName] || {
    name: roleName,
    description: "Explore your unique expression of this kink role in consensual BDSM dynamics.",
    detailsUrl: "https://www.bdsmwiki.info/Main_Page"
  };
}

// Helper function to format role name for display
export function formatRoleName(role: string): string {
  // Add space before capital letters
  return role
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/Daddy Mommy/g, 'Daddy/Mommy')
    .replace(/Master Mistress/g, 'Master/Mistress')
    .replace(/Primal Hunter/g, 'Primal Hunter')
    .replace(/Primal Prey/g, 'Primal Prey')
    .replace(/Rope bunny/g, 'Rope Bunny')
    .replace(/Brat Tamer/g, 'Brat Tamer')
    .replace(/Age player/g, 'Age Player');
}
