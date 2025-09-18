# TempMail - Temporary Email Management System

A modern web application for managing multiple temporary email accounts with localStorage support and domain selection.

## Features

### 🔐 User Account Management
- **Multiple Account Support**: Create and manage multiple email accounts
- **localStorage Persistence**: All account data is stored locally in the browser
- **Account Switching**: Seamlessly switch between different accounts
- **Account Removal**: Remove accounts you no longer need
- **Session Management**: Automatic login state management

### 🌐 Domain Management
- **Dynamic Domain Loading**: Fetch available domains from API
- **Domain Selection**: Choose from available domains when creating email accounts
- **Domain Information**: View account counts and email statistics for each domain
- **Real-time Updates**: Refresh domain list with current data

### 📧 Email Features
- **Compose Emails**: Create and send emails from any account
- **Inbox Management**: View and manage incoming emails
- **Email Organization**: Support for inbox, sent, drafts, spam, and trash folders
- **Search Functionality**: Search through your emails

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Theme Support**: User preference-based theming
- **Intuitive Navigation**: Easy-to-use interface with clear navigation
- **Loading States**: Proper loading indicators for better UX

## Technology Stack

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Custom hooks with localStorage
- **Icons**: Lucide React
- **Type Safety**: TypeScript

## Project Structure

```
tempmail-8/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── accounts/             # Email account management
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── domains/              # Domain management
│   │   ├── emails/               # Email management
│   │   └── user-accounts/        # User account management
│   ├── compose/                  # Email composition page
│   ├── create-email/             # Email account creation page
│   ├── inbox/                    # Main inbox page
│   └── page.tsx                  # Login/signup page
├── components/                   # Reusable UI components
│   ├── ui/                       # shadcn/ui components
│   └── domain-selector.tsx       # Domain selection component
├── hooks/                        # Custom React hooks
│   ├── use-user-accounts.ts      # User account management hook
│   └── use-domains.ts            # Domain management hook
├── lib/                          # Utility libraries
│   ├── email-service.ts          # Email service functions
│   ├── name-generator.ts         # Name generation utilities
│   ├── user-account-service.ts   # User account service
│   └── utils.ts                  # General utilities
└── public/                       # Static assets
```

## API Endpoints

### User Account Management
- `GET /api/user-accounts` - Get all user accounts
- `POST /api/user-accounts` - Create a new user account
- `GET /api/user-accounts/[accountId]` - Get specific account details
- `PUT /api/user-accounts/[accountId]` - Update account details
- `DELETE /api/user-accounts/[accountId]` - Delete an account

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Domain Management
- `GET /api/domains/site-domains` - Fetch available domains

### Email Management
- `GET /api/emails` - Fetch emails for an account
- `POST /api/accounts/create` - Create email account
- `DELETE /api/accounts/[emailAccountId]` - Delete email account
- `DELETE /api/emails/[emailAccountId]/[messageId]/delete` - Delete specific email

## Key Components

### User Account Service (`lib/user-account-service.ts`)
Handles all localStorage operations for user accounts:
- Account creation and management
- Session persistence
- Account switching
- Data validation

### User Accounts Hook (`hooks/use-user-accounts.ts`)
React hook for managing user account state:
- Authentication state
- Current account management
- Account switching
- Loading states

### Domain Management Hook (`hooks/use-domains.ts`)
React hook for managing domain data:
- Domain fetching and caching
- Error handling
- Refresh functionality
- Domain selection utilities

### Domain Selector Component (`components/domain-selector.tsx`)
Reusable component for domain selection:
- Visual domain cards
- Selection state management
- Domain statistics display
- Refresh functionality

### Main Pages
1. **Login/Signup Page** (`app/page.tsx`)
   - Tabbed interface for login and signup
   - Form validation
   - Error handling

2. **Inbox Page** (`app/inbox/page.tsx`)
   - Email list view
   - Account switching dropdown
   - Sidebar navigation
   - Account management
   - Quick access to create email accounts

3. **Compose Page** (`app/compose/page.tsx`)
   - Email composition interface
   - CC/BCC support
   - Rich text editing

4. **Create Email Page** (`app/create-email/page.tsx`)
   - Domain selection interface
   - Email account creation
   - Password generation
   - Real-time email preview

## localStorage Data Structure

### User Session
```typescript
interface UserSession {
  currentAccountId: string
  accounts: UserAccount[]
  lastActivity: string
}
```

### User Account
```typescript
interface UserAccount {
  id: string
  email: string
  password: string
  displayName?: string
  avatar?: string
  isActive: boolean
  createdAt: string
  lastLoginAt: string
  preferences: {
    theme: 'light' | 'dark' | 'system'
    language: string
    notifications: boolean
  }
}
```

### Domain Data
```typescript
interface Domain {
  id: number
  name: string
  accounts: number
  total_emails: string
  memory: string
}
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tempmail-8
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp sample.env .env.local
```

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating Your First Account
1. Navigate to the login page
2. Click on the "Create Account" tab
3. Fill in your email, password, and optional display name
4. Click "Create Account"

### Adding Multiple Accounts
1. After logging in, click on your avatar in the top-right corner
2. Click "Add another account"
3. Create a new account with different credentials
4. Switch between accounts using the dropdown menu

### Creating Email Accounts with Domain Selection
1. Click "Create Email" in the sidebar or "Create Email Account" in the dropdown
2. Browse available domains and select one
3. Enter a username for your email address
4. Set a password or use the "Generate" button
5. Click "Create Email Account"

### Managing Accounts
- **Switch Account**: Use the dropdown menu to switch between accounts
- **Remove Account**: Click "Remove this account" in the dropdown
- **Logout**: Click "Logout" to clear the current session

### Composing Emails
1. Click the "Compose" button in the sidebar
2. Fill in recipient, subject, and message
3. Use CC/BCC as needed
4. Click "Send" to send the email

## Domain Integration

The application integrates with external domain APIs to provide:
- **Real-time Domain Data**: Fetch current domain availability and statistics
- **Dynamic Domain Lists**: Automatically update available domains
- **Domain Statistics**: View account counts and email volumes per domain
- **Fallback Support**: Graceful handling when domain API is unavailable

## Security Considerations

⚠️ **Important**: This is a demonstration application with the following security considerations:

- Passwords are stored in plain text in localStorage (not recommended for production)
- No server-side authentication
- No encryption of sensitive data
- localStorage data is accessible via browser dev tools

For production use, consider:
- Implementing proper password hashing
- Adding server-side authentication
- Using secure session management
- Implementing data encryption
- Adding rate limiting and other security measures

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions, please open an issue in the repository. 