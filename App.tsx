import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, StatusBar, StyleSheet, View } from 'react-native';
import { LoaderScreen } from './src/screens/LoaderScreen';
import { MenuScreen } from './src/screens/MenuScreen';
import { GameScreen } from './src/screens/GameScreen';
import { GameOverScreen } from './src/screens/GameOverScreen';
import { LessonsScreen } from './src/screens/LessonsScreen';
import { FLASH_KIT, SEED_RECIPES, recipeFromSummary } from './src/game/recipes';
import type { Recipe, ResultSummary } from './src/game/recipes';
import { THEME } from './src/constants/theme';
import type { Units } from './src/utils/format';

type Screen = 'loader' | 'menu' | 'game' | 'gameover' | 'lessons';

/** Plain state machine, conditional render — no react-navigation (rule #2). */
export default function App() {
  const [screen, setScreen] = useState<Screen>('loader');
  const [units, setUnits] = useState<Units>('metres');
  const [defaultIso, setDefaultIso] = useState(100);
  const [activeFlashId, setActiveFlashId] = useState(FLASH_KIT[0].id);
  const [recipes, setRecipes] = useState<Recipe[]>(SEED_RECIPES);
  const [result, setResult] = useState<ResultSummary | null>(null);
  const [practice, setPractice] = useState(false);
  const [bestQuiz, setBestQuiz] = useState(0);

  const goMenu = useCallback(() => {
    setPractice(false);
    setScreen('menu');
  }, []);

  const goGame = useCallback(() => {
    setPractice(false);
    setScreen('game');
  }, []);

  const goPractice = useCallback(() => {
    setPractice(true);
    setScreen('game');
  }, []);

  const onGameOver = useCallback((summary: ResultSummary) => {
    if (summary.kind === 'recipe') {
      setRecipes(prev => prev.concat(recipeFromSummary(summary)));
    } else if (summary.quizCorrect !== undefined) {
      const score = summary.quizCorrect;
      setBestQuiz(prev => (score > prev ? score : prev));
    }
    setResult(summary);
    setScreen('gameover');
  }, []);

  const onPlayAgain = useCallback(() => {
    setScreen('game');
  }, []);

  // Android hardware back — every screen falls back to the hub (RN csv rule 13).
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'game' || screen === 'gameover' || screen === 'lessons') {
        goMenu();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [goMenu, screen]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {screen === 'loader' ? <LoaderScreen onFinish={goMenu} /> : null}

      {screen === 'menu' ? (
        <MenuScreen
          activeFlashId={activeFlashId}
          onSelectFlash={setActiveFlashId}
          recipeCount={recipes.length}
          bestQuiz={bestQuiz}
          units={units}
          defaultIso={defaultIso}
          onUnits={setUnits}
          onIso={setDefaultIso}
          onPlay={goGame}
          onLessons={() => setScreen('lessons')}
        />
      ) : null}

      {screen === 'game' ? (
        <GameScreen
          units={units}
          activeFlashId={activeFlashId}
          practice={practice}
          recipeCount={recipes.length}
          onBack={goMenu}
          onGameOver={onGameOver}
        />
      ) : null}

      {screen === 'gameover' && result ? (
        <GameOverScreen
          summary={result}
          units={units}
          onPlayAgain={onPlayAgain}
          onMenu={goMenu}
        />
      ) : null}

      {screen === 'lessons' ? (
        <LessonsScreen onBack={goMenu} onPractice={goPractice} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.colors.bg.primary },
});
