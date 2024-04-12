import {
  AuthUser,
  confirmSignIn,
  getCurrentUser,
  signIn,
} from 'aws-amplify/auth';
import { FormEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsInfoCircleFill } from 'react-icons/bs';
import { Button, Input, InputWrapper, Loader } from '.';

export const SignIn = ({
  onAuthorize,
}: {
  onAuthorize: (user: AuthUser | null) => void;
}) => {
  const { t } = useTranslation();
  const [state, setState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [unsafeUser, setUnsafeUser] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const inputUsernameRef = useRef<HTMLInputElement>(null);
  const passwordUsernameRef = useRef<HTMLInputElement>(null);

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!unsafeUser) return;

    setIsLoading(true);
    setMessage(null);

    const password = passwordUsernameRef.current?.value;
    if (!password) return;

    try {
      const { isSignedIn } = await confirmSignIn({
        challengeResponse: password,
      });

      if (isSignedIn) {
        const user = await getCurrentUser();

        onAuthorize(user);
        setIsLoading(false);
      } else {
        onAuthorize(null);
        setIsLoading(false);
      }
    } catch (error) {
      if ((error as { name?: string })?.name === 'InvalidPasswordException') {
        setMessage(t('invalidPassword'));
      }
      onAuthorize(null);
      setIsLoading(false);
    }
  };

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const username = inputUsernameRef.current?.value;
    const password = passwordUsernameRef.current?.value;
    if (!username || !password) return;

    try {
      const status = await signIn({
        username,
        password,
      });

      if (status.isSignedIn) {
        const user = await getCurrentUser();
        onAuthorize(user);
        setIsLoading(false);

        return;
      }

      if (
        status.nextStep.signInStep ===
        'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED'
      ) {
        setState(status.nextStep.signInStep);
        setUnsafeUser(username);
        setIsLoading(false);
      }
    } catch (error) {
      onAuthorize(null);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (state === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
    return (
      <div className="flex h-screen">
        <div className="m-auto w-3/4 md:w-96">
          <img
            src="./logo.png"
            alt="Culinary Journeys"
            className="mx-auto mb-20 w-40"
          />
          <p className="mb-10 text-center">{t('setNewPassword')}</p>
          {message && (
            <div className="mb-2 rounded-sm bg-red-50 p-4 text-red-500">
              <div className="mb-2 font-bold">
                <BsInfoCircleFill className="mr-1 inline" size={15} />
                {t('error')}:
              </div>
              <p>{message}</p>
            </div>
          )}
          <form onSubmit={handleChangePassword}>
            <InputWrapper>
              <Input
                ref={passwordUsernameRef}
                name="password"
                required
                type="password"
                placeholder={t('password')}
              />
            </InputWrapper>
            <InputWrapper>
              <Button full type="submit">
                {t('changePassword')}
              </Button>
            </InputWrapper>
          </form>
          <div className="mt-10 rounded-sm text-xs leading-relaxed text-gray-400">
            <div className="mb-2 font-bold">
              <BsInfoCircleFill className="mr-1 inline" size={15} />{' '}
              {t('passwordRequirements.title')}:
            </div>
            <ul className="ml-5">
              <li>. {t('passwordRequirements.minLenght', { amount: 8 })}</li>
              <li>
                . {t('passwordRequirements.containsNumber', { amount: 1 })}
              </li>
              <li>
                .{' '}
                {t('passwordRequirements.containsLowerCaseChar', { amount: 1 })}
              </li>
              <li>
                .{' '}
                {t('passwordRequirements.containsUpperCaseChar', { amount: 1 })}
              </li>
              <li>
                . {t('passwordRequirements.containsSpecialChar', { amount: 1 })}
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="m-auto w-3/4 md:w-96">
        <img
          src="./logo.png"
          alt="Culinary Journeys"
          className="mx-auto mb-20 w-40"
        />
        <form onSubmit={handleSignIn}>
          <InputWrapper>
            <Input
              ref={inputUsernameRef}
              name="username"
              required
              placeholder={t('username')}
            />
          </InputWrapper>
          <InputWrapper>
            <Input
              ref={passwordUsernameRef}
              name="password"
              required
              type="password"
              placeholder={t('password')}
            />
          </InputWrapper>
          <InputWrapper>
            <Button full type="submit">
              {t('login')}
            </Button>
          </InputWrapper>
        </form>
      </div>
    </div>
  );
};
