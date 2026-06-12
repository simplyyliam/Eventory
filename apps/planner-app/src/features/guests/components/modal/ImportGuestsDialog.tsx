import { IconButton } from "@/shared/components"
import { useGuestStore } from "@/store/useGuestStore"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@app/shared/components/ui/dialog"
import { useState, useRef } from "react"
import * as XLSX from "xlsx"

interface ImportGuestsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ImportGuestDialog = ({ open, onOpenChange }: ImportGuestsProps) => {
  const [rows, setRows] = useState<any[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const addBulkGuests = useGuestStore((s) => s.addBulkGuests)
  
  const handleFileUpdate = async (file: File) => {
    // Basic validation to ensure it's a spreadsheet
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      alert("Please upload a valid Excel or CSV file.")
      return
    }

    setFileName(file.name)
    const buffer = await file.arrayBuffer()

    const workbook = XLSX.read(buffer)
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(sheet)
    console.log("Parsed Rows:", data)
    setRows(data)
  }

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpdate(e.dataTransfer.files[0])
    }
  }

  // Handle clicking the zone to open file explorer
  const handleZoneClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpdate(e.target.files[0])
    }
  }

  const normalizeRows = (rows: any[]) => {
    return rows.map((row) => ({
      name: row.Name ?? row.name ?? '',
      email: row.Email ?? row.email ?? null,
      dietary: row.Dietary
        ? String(row.Dietary)
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean)
        : [],
      comments: row.Comments ?? row.comments ?? null,
    }));
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Import Guests</DialogTitle>
          <DialogDescription>
            Import guests using an Excel sheet or CSV file.
          </DialogDescription>
        </DialogHeader>

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx, .xls, .csv"
          className="hidden" 
        />

        {/* Drop Zone Box */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleZoneClick}
          className={`mt-4 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200
            ${isDragging 
              ? "border-primary bg-primary/10" 
              : "border-muted-foreground/20 hover:border-muted-foreground/50 bg-muted/30 hover:bg-muted/50"
            }`}
        >
          <div className="flex flex-col items-center justify-center gap-1.5 text-sm">
            <svg
              className="w-8 h-8 text-muted-foreground mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            
            {fileName ? (
              <p className="font-medium text-foreground">
                Selected: <span className="text-primary">{fileName}</span>
              </p>
            ) : (
              <>
                <p className="font-medium text-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  Excel (.xlsx, .xls) or CSV up to 10MB
                </p>
              </>
            )}
          </div>
        </div>

        {rows.length > 0 && (
          <p className="text-xs text-emerald-600 text-center mt-2 font-medium">
            ✓ Successfully parsed {rows.length} rows!
          </p>
        )}

        {rows.length > 0 && (
          <div className="mt-4 border rounded-md overflow-hidden">
            <div className="p-2 text-xs font-medium text-muted-foreground border-b">
              Preview ({rows.length} guests)
            </div>

            <div className="max-h-64 overflow-auto">
              {rows.slice(0, 10).map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-3 gap-2 px-3 py-2 text-xs border-b"
                >
                  <span>{row.Name ?? row.name}</span>
                  <span className="text-muted-foreground">
                    {row.Email ?? row.email}
                  </span>
                  <span className="text-muted-foreground">
                    {row.Dietary ?? row.dietary}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <IconButton 
          onClick={() => {
            const guests = normalizeRows(rows)
            addBulkGuests(guests)
            setRows([])
            setFileName(null)
            onOpenChange(false)
          }}
          Label={`Import ${rows.length} Guests`}
        />
      </DialogContent>
    </Dialog>
  )
}