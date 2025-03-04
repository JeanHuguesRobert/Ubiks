import { CircleAlert, Check, Clock, RefreshCw, ShieldAlert } from 'lucide-react';
import { AccountStatus } from '../../types/SocialAccount';

interface AccountStatusBadgeProps {
  status: AccountStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const AccountStatusBadge = ({ 
  status, 
  size = 'md', 
  showLabel = true 
}: AccountStatusBadgeProps) => {
  // Determine the styles based on status
  const getStyles = () => {
    switch (status) {
      case 'active':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          icon: <Check className="h-3 w-3" />
        };
      case 'pending':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          icon: <Clock className="h-3 w-3" />
        };
      case 'expired':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-800',
          icon: <CircleAlert className="h-3 w-3" />
        };
      case 'revoked':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          icon: <ShieldAlert className="h-3 w-3" />
        };
      case 'reconnecting':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          icon: <RefreshCw className="h-3 w-3 animate-spin" />
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          icon: <CircleAlert className="h-3 w-3" />
        };
    }
  };

  // Determine the sizing
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-1.5 py-0.5';
      case 'lg':
        return 'text-sm px-3 py-1';
      default:
        return 'text-xs px-2 py-0.5';
    }
  };

  // Get the label text
  const getLabel = () => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'pending':
        return 'Pending';
      case 'expired':
        return 'Expired';
      case 'revoked':
        return 'Revoked';
      case 'reconnecting':
        return 'Reconnecting';
      default:
        return 'Unknown';
    }
  };

  const styles = getStyles();
  const sizeClasses = getSizeClasses();

  return (
    <span 
      className={`inline-flex items-center rounded-full ${styles.bg} ${styles.text} font-medium ${sizeClasses}`}
    >
      <span className="mr-1">{styles.icon}</span>
      {showLabel && getLabel()}
    </span>
  );
};

export default AccountStatusBadge;
