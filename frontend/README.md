# The Real Johnson - Frontend Application

A beautiful, user-friendly React Native application for The Real Johnson Handyman marketplace, connecting homeowners with trusted contractors through an intuitive, transparent platform.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Key Features

### For Customers
- AI-powered job quotes from photos
- Multi-step job request wizard
- Real-time job tracking with milestones
- Escrow payment protection
- In-app chat with contractors

### For Contractors
- Document verification onboarding
- Job notifications and acceptance
- Material receipt uploads
- Progress tracking with photos
- Secure payment releases

## Documentation

- **[Design System Guide](./DESIGN_SYSTEM_GUIDE.md)** - Complete design token reference
- **[UI Redesign Summary](./UI_REDESIGN_SUMMARY.md)** - Comprehensive redesign documentation
- **[Feature Requirements](../FEATURE_REQUIREMENTS.md)** - Full feature specifications

## Project Structure

```
frontend/
├── app/                    # Expo Router screens
│   ├── auth/              # Authentication flows
│   ├── (customer)/        # Customer screens
│   └── (contractor)/      # Contractor screens
├── src/
│   ├── components/        # Reusable UI components
│   ├── constants/         # Design system tokens
│   ├── contexts/          # React contexts
│   ├── services/          # API client
│   └── utils/             # Helper functions
└── assets/                # Images, fonts
```

## Technology Stack

- React Native + Expo
- Expo Router (file-based routing)
- TypeScript
- React Query (data fetching)
- React Hook Form (forms)
- Custom Design System

## Design System

Import theme tokens and components:

```typescript
import { colors, spacing, typography } from '@/constants/theme';
import { Button, Card, Badge } from '@/components';
```

See [DESIGN_SYSTEM_GUIDE.md](./DESIGN_SYSTEM_GUIDE.md) for complete documentation.

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router](https://expo.github.io/router/docs/)
- [Ionicons](https://ionic.io/ionicons)
