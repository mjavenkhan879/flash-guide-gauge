import React, { useCallback } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native';
import {
  Aperture,
  BookOpen,
  ChevronLeft,
  HelpCircle,
  Ruler,
  Scale,
  Sun,
  TrendingDown,
  Umbrella,
} from 'lucide-react-native';
import { SPRITES } from '../assets';
import { AppBackground } from '../components/AppBackground';
import { LessonCard } from '../components/LessonCard';
import { IconButton, ScreenHeader } from '../components/ScreenHeader';
import type { LucideIcon } from '../components/ScreenHeader';
import { SecondaryButton } from '../components/SecondaryButton';
import { THEME } from '../constants/theme';

type Props = { onBack: () => void; onPractice: () => void };

type Lesson = {
  id: string;
  Icon: LucideIcon;
  title: string;
  formula: string;
  body: string;
  accent: string;
};

const A = THEME.colors.accent;

/** Eight cards, five sprites cycled across them — every Codex sprite is shown here. */
const LESSONS: Lesson[] = [
  {
    id: 'l1',
    Icon: BookOpen,
    title: 'Guide number basics',
    formula: 'GN = d x f',
    body: 'A guide number is just distance times aperture at ISO 100 and full power. Know two of the three and the third falls out.',
    accent: A.primary,
  },
  {
    id: 'l2',
    Icon: Ruler,
    title: 'Distance from GN',
    formula: 'd = GN / f',
    body: 'Fix the aperture you want for depth of field, then move the light until the maths agrees.',
    accent: A.flash,
  },
  {
    id: 'l3',
    Icon: Aperture,
    title: 'Aperture from GN',
    formula: 'f = GN / d',
    body: 'When the stand cannot move, solve the aperture instead and let depth of field follow the room.',
    accent: A.cool,
  },
  {
    id: 'l4',
    Icon: Sun,
    title: 'ISO scaling',
    formula: 'GN x sqrt(ISO / 100)',
    body: 'Four times the ISO doubles the guide number. Two stops of sensitivity buy one stop of reach.',
    accent: A.primary,
  },
  {
    id: 'l5',
    Icon: TrendingDown,
    title: 'Fractional power',
    formula: 'GN x sqrt(power)',
    body: 'Half power is not half the guide number. It is the square root, so 1/4 power costs exactly one half of the reach.',
    accent: A.flash,
  },
  {
    id: 'l6',
    Icon: Umbrella,
    title: 'Modifier stop loss',
    formula: 'GN / 2^(stops / 2)',
    body: 'An umbrella eats about 1.5 stops, a softbox about 2. Subtract before you divide, never after.',
    accent: A.cool,
  },
  {
    id: 'l7',
    Icon: Scale,
    title: 'Key to fill ratio',
    formula: 'ratio = 2^EV : 1',
    body: 'Two stops between key and fill reads as 4:1 - the classic portrait contrast that still shows shadow detail.',
    accent: A.primary,
  },
  {
    id: 'l8',
    Icon: HelpCircle,
    title: 'Inverse square falloff',
    formula: 'I = 1 / d^2',
    body: 'Double the distance and only a quarter of the light arrives. Near the subject a small move changes everything.',
    accent: A.flash,
  },
];

export function LessonsScreen({ onBack, onPractice }: Props) {
  const keyExtractor = useCallback((item: Lesson) => item.id, []);
  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<Lesson>) => (
      <LessonCard
        Icon={item.Icon}
        title={item.title}
        formula={item.formula}
        body={item.body}
        accent={item.accent}
        sprite={SPRITES[index % SPRITES.length]}
      />
    ),
    [],
  );

  return (
    <AppBackground variant="lessons">
      <ScreenHeader
        title="GUIDE LESSONS"
        subtitle="8 CARDS · PLAIN LANGUAGE"
        leftSlot={<IconButton Icon={ChevronLeft} onPress={onBack} label="Back to light kit" />}
      />

      <View style={styles.list}>
        <FlatList
          data={LESSONS}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          initialNumToRender={4}
          windowSize={5}
          contentContainerStyle={styles.content}
        />
      </View>

      <View style={styles.footer}>
        <SecondaryButton label="PRACTICE QUIZ" onPress={onPractice} />
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, paddingHorizontal: 18 },
  content: { paddingTop: 14, paddingBottom: 8 },
  footer: { paddingHorizontal: 18, paddingBottom: 24, paddingTop: 4 },
});

export default LessonsScreen;
