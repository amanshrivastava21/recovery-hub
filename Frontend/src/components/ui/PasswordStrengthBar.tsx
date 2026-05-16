import { validatePasswordStrength } from '@/utils/validators';

interface PasswordStrengthBarProps {
  password: string;
}

const PasswordStrengthBar = ({ password }: PasswordStrengthBarProps) => {
  const { score, label, color } = validatePasswordStrength(password);

  if (!password) {
    return null;
  }

  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full ${color} transition-all duration-300`}
            style={{ width: `${(score / 4) * 100}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${
          score === 1 ? 'text-red-500' :
          score === 2 ? 'text-yellow-500' :
          score === 3 ? 'text-blue-500' :
          'text-green-500'
        }`}>
          {label}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        {score === 1 && 'Add uppercase, numbers, and special characters'}
        {score === 2 && 'Add more variety to your password'}
        {score === 3 && 'Good password strength'}
        {score === 4 && 'Excellent password strength'}
      </p>
    </div>
  );
};

export default PasswordStrengthBar;
