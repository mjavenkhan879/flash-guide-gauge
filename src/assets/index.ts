/**
 * Fixed Codex asset contract. ONLY these names exist on disk —
 * never invent another file name here.
 */
export const ASSETS = {
  bgGame: require('../../assets/bg_game.png'),
  logo: require('../../assets/logo.png'),
  iconHome: require('../../assets/icon_home.png'),
  iconPause: require('../../assets/icon_pause.png'),
  sprite1: require('../../assets/sprite_1.png'),
  sprite2: require('../../assets/sprite_2.png'),
  sprite3: require('../../assets/sprite_3.png'),
  sprite4: require('../../assets/sprite_4.png'),
  sprite5: require('../../assets/sprite_5.png'),
  buttonRect: require('../../assets/button_rect.png'),
  buttonRound: require('../../assets/button_round.png'),
};

/** Ordered list so screens can cycle through the five themed sprites. */
export const SPRITES = [
  ASSETS.sprite1,
  ASSETS.sprite2,
  ASSETS.sprite3,
  ASSETS.sprite4,
  ASSETS.sprite5,
];

export default ASSETS;
