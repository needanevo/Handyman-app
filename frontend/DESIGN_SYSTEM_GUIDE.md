# Design System Quick Reference

## Importing Components

```typescript
// Import from index for clean imports
import { Button, Card, Badge, Input } from '@/components';

// Import theme tokens
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
```

---

## Colors

### Primary Actions & Trust
```typescript
colors.primary.main      // #2563EB - Main blue
colors.primary.light     // Lighter variant
colors.primary.dark      // Darker variant
colors.primary.lighter   // Very light
colors.primary.lightest  // Background tint
```

### Secondary Actions & Energy
```typescript
colors.secondary.main    // #F97316 - Orange
colors.secondary.light
colors.secondary.dark
colors.secondary.lighter
colors.secondary.lightest
```

### Status Colors
```typescript
colors.success.main      // #10B981 - Green (approvals, completed)
colors.warning.main      // #F59E0B - Amber (pending, alerts)
colors.error.main        // #EF4444 - Red (errors, rejections)
```

### Neutral Scale
```typescript
colors.neutral[900]      // Darkest - primary text
colors.neutral[700]      // Dark - secondary text
colors.neutral[600]      // Medium - labels
colors.neutral[400]      // Light - placeholders
colors.neutral[300]      // Borders
colors.neutral[100]      // Light backgrounds
colors.neutral[50]       // Lightest backgrounds
```

---

## Typography

### Sizes
```typescript
typography.sizes.xs      // 12px - captions
typography.sizes.sm      // 14px - small text
typography.sizes.base    // 16px - body text (default)
typography.sizes.lg      // 18px - emphasized text
typography.sizes.xl      // 20px - section titles
typography.sizes['2xl']  // 24px - page titles
typography.sizes['3xl']  // 30px - hero titles
typography.sizes['4xl']  // 36px - display text
```

### Weights
```typescript
typography.weights.regular    // 400
typography.weights.medium     // 500
typography.weights.semibold   // 600
typography.weights.bold       // 700
```

### Example Usage
```typescript
const styles = StyleSheet.create({
  title: {
    ...typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
  },
  body: {
    ...typography.sizes.base,
    color: colors.neutral[700],
    lineHeight: 24,
  },
});
```

---

## Spacing

### Scale
```typescript
spacing.xs      // 4px
spacing.sm      // 8px
spacing.md      // 12px
spacing.base    // 16px (default)
spacing.lg      // 20px
spacing.xl      // 24px
spacing['2xl']  // 32px
spacing['3xl']  // 40px
spacing['4xl']  // 48px
spacing['5xl']  // 64px
```

### Example Usage
```typescript
const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,              // 24px all sides
    paddingHorizontal: spacing.xl,    // 24px left/right
    paddingVertical: spacing.lg,      // 20px top/bottom
    gap: spacing.md,                  // 12px between flex items
  },
});
```

---

## Border Radius

```typescript
borderRadius.sm      // 4px
borderRadius.md      // 8px (default for most)
borderRadius.lg      // 12px (cards)
borderRadius.xl      // 16px (large cards)
borderRadius['2xl']  // 24px
borderRadius.full    // 9999px (circles)
```

---

## Shadows

```typescript
shadows.sm   // Subtle shadow
shadows.md   // Medium shadow (cards)
shadows.lg   // Prominent shadow
shadows.xl   // Very prominent shadow
```

### Example Usage
```typescript
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    ...shadows.md,  // Spreads all shadow properties
  },
});
```

---

## Component Usage

### Button
```typescript
<Button
  title="Submit"
  onPress={handleSubmit}
  variant="primary"     // primary, secondary, outline, ghost, success, error
  size="large"          // small, medium, large
  fullWidth
  loading={isLoading}
  disabled={!isValid}
  icon={<Ionicons name="checkmark" size={20} color="#fff" />}
/>
```

### Card
```typescript
<Card
  variant="elevated"    // elevated, outlined, flat
  padding="lg"          // xs, sm, md, base, lg, xl, 2xl
  onPress={handlePress} // Makes it touchable
  style={styles.customCard}
>
  <Text>Card content</Text>
</Card>
```

### Badge
```typescript
<Badge
  label="Completed"
  variant="success"     // primary, success, warning, error, neutral, escrow
  size="md"             // sm, md, lg
/>
```

### Input
```typescript
<Input
  label="Email Address"
  value={email}
  onChangeText={setEmail}
  placeholder="you@example.com"
  icon="mail-outline"
  error={errors.email}
  required
  helpText="We'll never share your email"
  keyboardType="email-address"
/>
```

### ProgressBar
```typescript
<ProgressBar
  progress={75}
  label="Job Progress"
  showPercentage
  variant="success"     // primary, success, warning
  height={12}
/>
```

### StepIndicator
```typescript
<StepIndicator
  steps={[
    { label: 'Photos', completed: true },
    { label: 'Describe', completed: false },
    { label: 'Review', completed: false },
  ]}
  currentStep={1}
/>
```

### PhotoUploader
```typescript
<PhotoUploader
  photos={photos}
  onPhotosChange={setPhotos}
  maxPhotos={5}
  label="Problem Photos"
  helpText="Take clear photos from different angles"
  required
/>
```

### EmptyState
```typescript
<EmptyState
  icon="document-outline"
  title="No jobs yet"
  description="When you post a job, you'll see it here"
  actionLabel="Request a Job"
  onAction={handleRequestJob}
/>
```

---

## Layout Patterns

### Screen Container
```typescript
<SafeAreaView style={styles.container}>
  <ScrollView contentContainerStyle={styles.content}>
    {/* Content */}
  </ScrollView>
</SafeAreaView>

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,  // 24px
    paddingBottom: spacing['2xl'],   // 32px
  },
});
```

### Section
```typescript
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Section Title</Text>
  {/* Section content */}
</View>

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
});
```

### Card Grid
```typescript
<View style={styles.grid}>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</View>

const styles = StyleSheet.create({
  grid: {
    gap: spacing.md,
  },
});
```

---

## Accessibility

### Minimum Touch Targets
```typescript
touchTarget.minHeight  // 44px
touchTarget.minWidth   // 44px

// All buttons automatically meet this
// For custom touchables:
const styles = StyleSheet.create({
  touchable: {
    minHeight: touchTarget.minHeight,
    minWidth: touchTarget.minWidth,
  },
});
```

### Color Contrast
All color combinations in the theme meet WCAG AA standards:
- Primary text on white: 7.0:1
- Secondary text on white: 4.5:1
- Error text on white: 4.5:1

---

## Animation

### Timing
```typescript
animation.fast    // 150ms - hover states
animation.normal  // 250ms - transitions
animation.slow    // 350ms - page transitions
```

### Example
```typescript
import { Animated } from 'react-native';

const fadeAnim = new Animated.Value(0);

Animated.timing(fadeAnim, {
  toValue: 1,
  duration: animation.normal,
  useNativeDriver: true,
}).start();
```

---

## Common Patterns

### Header with Back Button
```typescript
<View style={styles.header}>
  <Button
    title=""
    onPress={() => router.back()}
    variant="ghost"
    size="small"
    icon={<Ionicons name="arrow-back" size={24} color={colors.primary.main} />}
  />
</View>
```

### List Item with Arrow
```typescript
<Card onPress={handlePress} style={styles.listItem}>
  <View style={styles.listContent}>
    <Text style={styles.listTitle}>Item Title</Text>
    <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
  </View>
</Card>
```

### Status with Icon and Text
```typescript
<View style={styles.status}>
  <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
  <Text style={styles.statusText}>Completed</Text>
</View>

const styles = StyleSheet.create({
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusText: {
    ...typography.sizes.base,
    color: colors.neutral[700],
  },
});
```

### Divider
```typescript
<View style={styles.divider} />

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing.lg,
  },
});
```

---

## Do's and Don'ts

### Do
- Use theme tokens instead of hardcoded values
- Follow the 8-point spacing grid
- Maintain consistent component patterns
- Test on both iOS and Android
- Ensure minimum 44px touch targets
- Use semantic colors (success for completed, warning for pending)

### Don't
- Don't use hardcoded colors or sizes
- Don't create one-off component variants
- Don't ignore accessibility standards
- Don't use emojis in UI (icons only)
- Don't make touch targets smaller than 44px
- Don't mix spacing scales inconsistently

---

## Resources

### Icons
We use Ionicons from `@expo/vector-icons`:
- Browse: https://ionic.io/ionicons
- Import: `import { Ionicons } from '@expo/vector-icons';`

### Color Picker
For new colors, ensure WCAG AA contrast:
- Tool: https://webaim.org/resources/contrastchecker/

### Spacing Calculator
Based on 8-point grid:
- 4, 8, 12, 16, 20, 24, 32, 40, 48, 64

---

## Getting Help

### File Locations
- Theme: `/src/constants/theme.ts`
- Components: `/src/components/`
- Examples: See any screen in `/app/(customer)/`

### Common Issues
1. **Colors not showing?** Check import: `import { colors } from '@/constants/theme';`
2. **Spacing looks off?** Use theme spacing, not hardcoded numbers
3. **Component not working?** Check it's exported in `/src/components/index.ts`
