"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Save } from "lucide-react"

interface RequestStatusUpdateProps {
  requestId: string
  currentStatus: string
}

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "sent", label: "Sent" },
  { value: "responded", label: "Responded" },
  { value: "completed", label: "Completed" },
  { value: "appealed", label: "Appealed" },
  { value: "denied", label: "Denied" },
]

export function RequestStatusUpdate({
  requestId,
  currentStatus,
}: RequestStatusUpdateProps) {
  const router = useRouter()
  const supabase = createClient()
  const [status, setStatus] = useState(currentStatus)
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdate = async () => {
    setIsLoading(true)

    try {
      const updateData: Record<string, any> = {
        status,
        updated_at: new Date().toISOString(),
      }

      if (notes.trim()) {
        // Append to existing notes
        const { data: current } = await supabase
          .from("rtk_requests")
          .select("notes")
          .eq("id", requestId)
          .single()

        const existingNotes = current?.notes || ""
        const timestamp = new Date().toLocaleString()
        updateData.notes = existingNotes
          ? `${existingNotes}\n\n[${timestamp}]\n${notes}`
          : `[${timestamp}]\n${notes}`
      }

      if (status === "responded" || status === "completed") {
        updateData.response_received_at = new Date().toISOString()
      }

      await supabase
        .from("rtk_requests")
        .update(updateData)
        .eq("id", requestId)

      setNotes("")
      router.refresh()
    } catch (error) {
      console.error("Failed to update status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Status</CardTitle>
        <CardDescription>
          Track the progress of your request
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Add Note (optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about the response or status change..."
            rows={3}
          />
        </div>

        <Button
          onClick={handleUpdate}
          disabled={isLoading || status === currentStatus && !notes.trim()}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Update Status
        </Button>
      </CardContent>
    </Card>
  )
}
