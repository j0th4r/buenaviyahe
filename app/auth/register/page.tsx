'use client'

import { useState } from "react"
import Link from "next/link"
import { RegisterUser } from "@/lib/api/register"
import Image from "next/image"

interface ButtonProps {
    className?: string
    icon?: string
    children?: React.ReactNode
    onClick?: () => void
    type?: "button" | "reset" | "submit"
    isDisabled?: boolean
}

const Button = ({
    className,
    icon,
    children,
    onClick,
    type,
    isDisabled = false
}: ButtonProps) => {
    return (
        <button 
            className={`${className} flex justify-center items-center p-2`}
            type={type}
            onClick={onClick}
            disabled={isDisabled}
        >
            {icon && (
                <span className="material-symbols-outlined">{icon}</span>
            )}
            {children}
        </button>
    )
}

interface InputProps {
    type: string
    name: string
    icon?: string
    placeholder?: string
    className?: string
}

const Input = ({
    type,
    name,
    icon,
    placeholder,
    className
}: InputProps) => {
    return (
        <div className={`border border-text-inactive h-12 rounded-3xl w-full flex items-center p-2 text-black bg-white ${className}`}>
            {icon && (<span className="material-symbols-outlined">{icon}</span>)}
            <input type={type} id={name} name={name} placeholder={placeholder} className="w-full ml-2 outline-none font-poppins ring-0 focus:outline-none focus:ring-0" autoComplete="off"/>
        </div>
        
    )
} 

// TODO: Add Register function
const Register = () => {
    const [isPasswordVisible,  setIsPasswordVisible] = useState<boolean>(false)
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState<boolean>(false)
    const [isLogging, setIsLogging] = useState<boolean>(false)
    const [error, setError] = useState<string>('')

    const HandleRegister = async (formData: FormData) => {
        setIsLogging(true)
        
        const password = formData.get("password") as string
        const confirmPassword = formData.get("confirm_password") as string

        if (password !== confirmPassword) {
            setError('Passwords do not match')
        }

        const result = await RegisterUser(formData)
        
        if (result?.error) {
            setIsLogging(false)
            setError(result.error)
        }
    }

    return (
        <>
            <div className="font-poppins flex flex-col h-screen">
                {/* Logo Section */}
                <div className="flex flex-col justify-center items-center flex-[1]">
                    <Image
                        src={require("@/public/logo.png")}
                        alt="Buena Viyahe Logo"
                        width={300}
                        height={161}
                        className="mx-auto"
                        priority
                    />
                </div>
 
                {/* Children Section */}
                <div className="flex flex-col justify-end overflow-hidden bg-[#F8B91A] rounded-t-2xl">
                    <h1 className="font-baloo text-3xl text font-bold text-center text-white mt-4">Hello!</h1>
                        <form className="p-4 flex flex-col gap-y-4" action={HandleRegister}>
                            <Input name="username" type="text" icon="person" placeholder="Username"/>
                            <Input name="email" type="email" icon="email" placeholder="Email"/>
                            <div className="bg-white rounded-3xl flex flex-row">
                                <Input
                                    name="password"
                                    type={isPasswordVisible ? "text" : "password"}   // 👈 toggle input type
                                    icon="key"
                                    placeholder="Password"
                                    className="border-0"
                                />
                                <Button
                                    icon={isPasswordVisible ? "visibility_off" : "visibility"}  // 👈 change icon too if you like
                                    type="button"
                                    onClick={() => setIsPasswordVisible(prev => !prev)}   // 👈 correct toggle
                                />
                            </div>
                            <div className="bg-white rounded-3xl flex flex-row">
                                <Input
                                    name="confirm_password"
                                    type={isConfirmPasswordVisible ? "text" : "password"}   // 👈 toggle input type
                                    icon="key"
                                    placeholder="Confirm Password"
                                    className="border-0"
                                />
                                <Button
                                    icon={isConfirmPasswordVisible ? "visibility_off" : "visibility"}  // 👈 change icon too if you like
                                    type="button"
                                    onClick={() => setIsConfirmPasswordVisible(prev => !prev)}   // 👈 correct toggle
                                />
                            </div>

                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                            <Button 
                                type="submit" 
                                className="py-2 rounded-xl bg-white" 
                                isDisabled={isLogging}
                            >
                                {isLogging ? "Registering..." : "Register"}
                            </Button>

                            <p className="text-center">Already have an account? <Link href="/auth/login" className="underline underline-offset-2">Login</Link></p>
                        </form>
                </div>
            </div>
            
        </>
        
    )
}

export default Register