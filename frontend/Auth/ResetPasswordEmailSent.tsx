import { Button, ButtonKind } from "../Styleguide/Button";
import { Anchor } from "../Styleguide/Anchor";
import { useNavigate, useLocation } from "react-router";
import { useEffect } from "react";

export function ResetPasswordEmailSent(props: Props) {
  const { email } = useLocation().state as { email: string };
  const navigate = useNavigate();

  useEffect(() => {
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate]);

  if (!email) {
    return null;
  }

  return (
    <div className="flex justify-center h-screen">
      <div className="pt-40 max-w-sm">
        <h1 className="text-xl text-gray-500 place-self-start mb-2">
          Email Sent
        </h1>
        <p className="text-left text-s text-gray-600 py-8 mb-60">
          An email with reset instructions has been sent to {email}
        </p>
        <div className="flex space-x-4 my-8">
          <Button kind={ButtonKind.primary} className="w-full mt-2">
            <Anchor kind={ButtonKind.primary} to="/login">
              Return To Sign In
            </Anchor>
          </Button>
        </div>
      </div>
    </div>
  );
}

interface Props {}
