'use client'

// Hook
import { useCallback, useState } from "react";
import { useForm, FieldValues, SubmitHandler } from "react-hook-form";

// Components
import Input from "@/app/components/input/Input";
import Button from "@/app/components/Button";
import AuthSocialButton from "./AuthSocialButton";

// Type
type VariantType = 'LOGIN' | 'REGISTER';

const AuthForm = () => {
  const [variant, setVariant] = useState<VariantType>('LOGIN');
  const [isLoaindg, setIsLoading] = useState(false);

  const toggleVariant = useCallback(() => {
    if (variant === 'LOGIN') {
      setVariant('REGISTER')
    } else {
      setVariant('LOGIN')
    }
  }, []);


  const {
    register,
    handleSubmit,
    formState: {
      errors
    }
  } = useForm<FieldValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    }
  })

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    if (variant === 'REGISTER') {
      // Axios Register
    }
    else {
      // NextAuth SignIn
    }
  }

  const socialAction = (action: string) => {
    setIsLoading(true);

    // NextAuth Social Sign In
  }

  return (
    <div
      className="
        mt-8
        sm:mx-auto
        sm:w-full
        sm:max-w-md
      "
    >
      <div
        className="
          bg-white
          px-4
          py-8
          shadow
          sm:rounded-lg
          sm:px-10
        "
      >
        <form
          className="space-y-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          {variant === 'REGISTER' && (
            <Input
              id="name"
              label="Name"
              register={register}
              errors={errors}
            />
          )}
          <Input
            id="email"
            label="Email address"
            register={register}
            errors={errors}
          />
          <Input
            id="password"
            label="Password"
            register={register}
            errors={errors}
          />
          <div>
            <Button
              type="submit"
              fullWidth
              disabled={isLoaindg}
            >
              {variant === 'LOGIN' ? 'Sign in' : 'Register'}
            </Button>
          </div>
        </form>

        {/* Anoter login method */}
        <div className="mt-6">
          <div className="relative">
            {/* divider */}
            <div
              className="
                absolute
                inset-0
                flex
                items-center
              "
            >
              <div className="
                w-full
                border-t
                border-gray-300  
              " />
            </div>
            {/* text */}
            <div className="
                  relative
                  flex
                  justify-center
                  text-sm
            ">
              <span className="
                    bg-white
                    px-2
                    text-gray-500
                  ">
                Or continue with
              </span>
            </div>
          </div>
            {/* Social login in */}
          <div className="mt-6 ">
            <AuthSocialButton />
          </div>

        </div>
      </div>
    </div>
  )
}

export default AuthForm