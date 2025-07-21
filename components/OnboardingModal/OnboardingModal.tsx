import { useOnboarding } from "@/hooks/useOnboarding";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StepWelcome } from "./steps/StepWelcome";
import { StepRole } from "./steps/StepRole";
import { StepExperience } from "./steps/StepExperience";
import { StepInterests } from "./steps/StepInterests";
import { StepTechStack } from "./steps/StepTechStack";
import { useState, useEffect } from "react";

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

export function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  const {
    currentStep,
    steps,
    formData,
    nextStep,
    prevStep,
    updateFormData,
    completeOnboarding,
  } = useOnboarding();

  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const getUserFromSession = () => {
    try {
      const userData = sessionStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data from sessionStorage:", error);
      return null;
    }
  };

  const checkOnboardingStatus = async (): Promise<boolean> => {
    try {
      const user = getUserFromSession();
      if (!user?.uid) {
        console.error("No user UID found in sessionStorage");
        return false;
      }

      const response = await fetch(
        `http://localhost:8080/api/users/onboarding-status/${user.uid}`
      );

      if (!response.ok) {
        console.error("Failed to check onboarding status:", response.statusText);
        return false;
      }

      const data = await response.json();
      return data.hasCompletedOnboarding === true;
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      return false;
    }
  };

  useEffect(() => {
    const checkInitialStatus = async () => {
      if (!open) {
        setIsCheckingStatus(false);
        setShouldShowModal(false);
        return;
      }

      setIsCheckingStatus(true);

      try {
        const hasCompleted = await checkOnboardingStatus();
        setShouldShowModal(!hasCompleted);

        if (hasCompleted) {
          console.log("User already completed onboarding, not showing modal");
          onClose();
        }
      } catch (error) {
        console.error("Error checking initial onboarding status:", error);
        setShouldShowModal(true); // fallback: mostra o modal se erro
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkInitialStatus();
  }, [open, onClose]);

  const handleCompleteOnboarding = async () => {
    const user = getUserFromSession();
    if (!user?.uid) {
      console.error("Cannot complete onboarding: No user UID found in sessionStorage");
      alert("Erro: dados do usuário não encontrados. Faça login novamente.");
      return;
    }

    setIsChecking(true);

    try {
      await completeOnboarding();
      await new Promise((resolve) => setTimeout(resolve, 500));
      const isCompleted = await checkOnboardingStatus();

      if (isCompleted) {
        setShouldShowModal(false);
        onClose();
      } else {
        console.error("Onboarding completion not confirmed by API");
        alert("Erro ao finalizar configuração. Tente novamente.");
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      alert("Erro ao finalizar configuração. Verifique sua conexão e tente novamente.");
    } finally {
      setIsChecking(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepWelcome onNext={nextStep} />;
      case 1:
        return (
          <StepRole
            value={formData.role}
            onChange={(value) => updateFormData("role", value)}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 2:
        return (
          <StepExperience
            value={formData.experience}
            onChange={(value) => updateFormData("experience", value)}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <StepInterests
            values={formData.interests}
            onChange={(values) => updateFormData("interests", values)}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <StepTechStack
            languages={formData.languages}
            tools={formData.tools}
            onChange={(field, values) => updateFormData(field, values)}
            onBack={prevStep}
            onComplete={handleCompleteOnboarding}
          />
        );
      default:
        return null;
    }
  };

  if (isCheckingStatus) {
    return null; // nada aparece enquanto está checando
  }

  if (!shouldShowModal) {
    return null; // se não deve mostrar o modal, renderiza nada
  }

  return (
    <Dialog open={shouldShowModal} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-[500px]"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{steps[currentStep].title}</DialogTitle>
        </DialogHeader>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {isChecking ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-slate-600">Finalizing setup...</span>
          </div>
        ) : (
          renderStep()
        )}
      </DialogContent>
    </Dialog>
  );
}
