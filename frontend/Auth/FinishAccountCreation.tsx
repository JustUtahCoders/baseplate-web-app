import { useState, FormEvent } from "react";
import { useMutation } from "react-query";
import { Redirect, RouteProps, useHistory } from "react-router";
import { FormField } from "../Styleguide/FormField";
import { FormFieldLabel } from "../Styleguide/FormFieldLabel";
import { Input } from "../Styleguide/Input";
import { baseplateFetch } from "../Utils/baseplateFetch";
import { unary } from "lodash-es";
import { Button, ButtonKind } from "../Styleguide/Button";

export function FinishAccountCreation(props: RouteProps) {
  const searchParams = new URLSearchParams(props.location?.search);
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [givenName, setGivenName] = useState(
    searchParams.get("givenName") || ""
  );
  const [familyName, setFamilyName] = useState(
    searchParams.get("familyName") || ""
  );
  const githubAccessToken = searchParams.get("githubAccessToken");
  const history = useHistory();

  const submitMutation = useMutation<
    APIResult,
    Error,
    FormEvent<HTMLFormElement>
  >(
    (evt) => {
      evt.preventDefault();
      return baseplateFetch<APIResult>(`/auth/github/finish-account-creation`, {
        method: "POST",
        body: {
          email,
          givenName,
          familyName,
          githubAccessToken,
        },
      });
    },
    {
      async onSuccess(data, variables, context) {
        if (data.success) {
          location.href = "/auth/github";
        } else {
          throw Error(`Failed to create Baseplate account with Github token`);
        }
      },
      async onError(err, variables, context) {
        throw err;
      },
    }
  );

  if (!githubAccessToken) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="flex justify-center h-screen">
      <form className="pt-40" onSubmit={unary(submitMutation.mutate)}>
        <h1 className="text-xl text-gray-500 place-self-start mb-6">
          Finish creating your account
        </h1>
        <FormField>
          <FormFieldLabel htmlFor="email">Email</FormFieldLabel>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(evt) => setEmail(evt.target.value)}
            required
          />
        </FormField>
        <FormField>
          <FormFieldLabel htmlFor="givenName">Given Name</FormFieldLabel>
          <Input
            id="given-name"
            type="text"
            value={givenName}
            onChange={(evt) => setGivenName(evt.target.value)}
            required
          />
        </FormField>
        <FormField>
          <FormFieldLabel htmlFor="email">Family Name</FormFieldLabel>
          <Input
            id="family-name"
            type="text"
            value={familyName}
            onChange={(evt) => setFamilyName(evt.target.value)}
            required
          />
        </FormField>
        <div className="flex space-x-4 my-8">
          <Button kind={ButtonKind.primary} type="submit" className="mr-8">
            Create Account
          </Button>
        </div>
      </form>
    </div>
  );
}

interface APIResult {
  success: boolean;
}
