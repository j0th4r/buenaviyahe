'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserPlus, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface BusinessRegistrationFormProps {
  onSuccess?: () => void
}

export function BusinessRegistrationForm({
  onSuccess,
}: BusinessRegistrationFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    ownerName: '',
    email: '',
    address: '',
    website: '',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(
        '/api/admin/business-registration/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      toast({
        title: 'Success',
        description:
          data.message || 'Business owner registered successfully',
      })

      // Reset form
      setFormData({
        ownerName: '',
        email: '',
        address: '',
        website: '',
        description: '',
      })

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }

      // Refresh the page to update the table
      router.refresh()
    } catch (error) {
      console.error('Registration error:', error)
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to register business owner',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ownerName">Business Owner Full Name *</Label>
        <Input
          id="ownerName"
          placeholder="Travel Agency Inc."
          value={formData.ownerName}
          onChange={handleInputChange}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          placeholder="owner@business.com"
          value={formData.email}
          onChange={handleInputChange}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address/Location *</Label>
        <Textarea
          id="address"
          placeholder="Complete address including barangay, city, province"
          className="min-h-[80px]"
          value={formData.address}
          onChange={handleInputChange}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website (Optional)</Label>
        <Input
          id="website"
          type="url"
          placeholder="https://www.business.com"
          value={formData.website}
          onChange={handleInputChange}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          About/Description (Optional)
        </Label>
        <Textarea
          id="description"
          placeholder="Brief description about the business owner or their tourism business"
          className="min-h-[100px]"
          value={formData.description}
          onChange={handleInputChange}
          disabled={isLoading}
        />
      </div>

      <div className="pt-4 border-t">
        <Button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Registering...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Register Business Owner
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
