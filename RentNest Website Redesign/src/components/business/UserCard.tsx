import React from "react";
import { Mail, Phone, Shield } from "lucide-react";
import { Card } from "../ui/Card";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

export interface UserCardProps {
  fullName: string;
  email: string;
  phone?: string;
  roleName: string;
  avatarUrl?: string;
  onManage?: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  fullName,
  email,
  phone,
  roleName,
  avatarUrl,
  onManage,
}) => {
  return (
    <Card variant="default" className="p-5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Avatar src={avatarUrl} fallbackInitials={fullName[0]} size="lg" status="online" />
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-heading text-sm font-bold text-foreground">{fullName}</h4>
            <Badge variant="secondary" className="text-[9px]">
              <Shield className="h-3 w-3 mr-1" />
              {roleName.replace("ROLE_", "")}
            </Badge>
          </div>

          <div className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{email}</span>
            </div>
            {phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {onManage && (
        <Button variant="outline" size="sm" onClick={onManage}>
          Manage Account
        </Button>
      )}
    </Card>
  );
};
