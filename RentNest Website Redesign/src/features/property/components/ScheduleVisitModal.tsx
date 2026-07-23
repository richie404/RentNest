import React from "react";
import { useForm } from "react-hook-form";
import { Calendar as CalendarIcon, Clock, User, Mail, Phone, CheckCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useScheduleVisitMutation } from "../hooks/useProperties";
import type { VisitSchedulePayload } from "../types/property";

interface ScheduleVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: number;
  propertyTitle: string;
}

export const ScheduleVisitModal: React.FC<ScheduleVisitModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
}) => {
  const scheduleMutation = useScheduleVisitMutation();

  const { register, handleSubmit } = useForm<VisitSchedulePayload>({
    defaultValues: {
      propertyId,
      visitDate: "2026-08-05",
      visitTime: "10:00 AM",
      visitorName: "",
      visitorEmail: "",
      visitorPhone: "",
    },
  });

  const onSubmit = (data: VisitSchedulePayload) => {
    scheduleMutation.mutate(data, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule an In-Person Tour" maxWidth="md">
      <p className="text-xs text-muted-foreground mb-4">
        Touring: <strong className="text-foreground">{propertyTitle}</strong>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Preferred Date"
            type="date"
            leftIcon={<CalendarIcon className="h-4 w-4" />}
            {...register("visitDate", { required: true })}
          />
          <Input
            label="Preferred Time"
            type="text"
            placeholder="10:00 AM"
            leftIcon={<Clock className="h-4 w-4" />}
            {...register("visitTime", { required: true })}
          />
        </div>

        <Input
          label="Full Name"
          type="text"
          placeholder="Jane Doe"
          leftIcon={<User className="h-4 w-4" />}
          {...register("visitorName", { required: true })}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="jane@example.com"
          leftIcon={<Mail className="h-4 w-4" />}
          {...register("visitorEmail", { required: true })}
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="(555) 000-0000"
          leftIcon={<Phone className="h-4 w-4" />}
          {...register("visitorPhone", { required: true })}
        />

        <div className="pt-3 flex gap-3">
          <Button type="button" variant="outline" className="w-1/2" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="w-1/2"
            isLoading={scheduleMutation.isPending}
            leftIcon={<CheckCircle className="h-4 w-4" />}
          >
            Confirm Booking
          </Button>
        </div>
      </form>
    </Modal>
  );
};
