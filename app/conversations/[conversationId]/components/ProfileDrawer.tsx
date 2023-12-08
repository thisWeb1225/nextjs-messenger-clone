// Prisma Type
import { Conversation, User } from '@prisma/client';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: Conversation & {
    users: User[];
  };
}

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  return <div>ProfileDrawer</div>;
};

export default ProfileDrawer;
