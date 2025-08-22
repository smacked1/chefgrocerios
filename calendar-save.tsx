import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, Clock, MapPin, Users, Save, Download } from "lucide-react";

interface CalendarSaveProps {
  title?: string;
  startDate?: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  location?: string;
}

export function CalendarSave({ 
  title = "",
  startDate = "",
  startTime = "",
  endTime = "",
  description = "",
  location = ""
}: CalendarSaveProps) {
  const [eventTitle, setEventTitle] = useState(title);
  const [eventDate, setEventDate] = useState(startDate || new Date().toISOString().split('T')[0]);
  const [eventStartTime, setEventStartTime] = useState(startTime || "12:00");
  const [eventEndTime, setEventEndTime] = useState(endTime || "13:00");
  const [eventDescription, setEventDescription] = useState(description);
  const [eventLocation, setEventLocation] = useState(location);
  const [eventType, setEventType] = useState("cooking");
  const [attendees, setAttendees] = useState("");
  const { toast } = useToast();

  const generateCalendarFile = () => {
    const startDateTime = new Date(`${eventDate}T${eventStartTime}:00`);
    const endDateTime = new Date(`${eventDate}T${eventEndTime}:00`);
    
    // Format dates for ICS file (YYYYMMDDTHHMMSSZ)
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ChefGrocer//ChefGrocer App//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@chefgrocer.app`,
      `DTSTART:${formatDate(startDateTime)}`,
      `DTEND:${formatDate(endDateTime)}`,
      `SUMMARY:${eventTitle}`,
      `DESCRIPTION:${eventDescription}`,
      `LOCATION:${eventLocation}`,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    return icsContent;
  };

  const downloadCalendarFile = () => {
    if (!eventTitle.trim()) {
      toast({
        title: "Missing Title",
        description: "Please enter an event title",
        variant: "destructive"
      });
      return;
    }

    const icsContent = generateCalendarFile();
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${eventTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    link.click();

    toast({
      title: "Calendar Event Saved",
      description: "Event has been downloaded to your device",
    });
  };

  const saveToDeviceCalendar = () => {
    if (!eventTitle.trim()) {
      toast({
        title: "Missing Title", 
        description: "Please enter an event title",
        variant: "destructive"
      });
      return;
    }

    // Try to open the device's calendar app
    const startDateTime = new Date(`${eventDate}T${eventStartTime}:00`);
    const endDateTime = new Date(`${eventDate}T${eventEndTime}:00`);
    
    // Google Calendar URL format
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(eventDescription)}&location=${encodeURIComponent(eventLocation)}`;
    
    // Try to open Google Calendar first
    window.open(googleCalendarUrl, '_blank');

    toast({
      title: "Opening Calendar",
      description: "Opening your calendar app to save the event",
    });
  };

  const eventTypeOptions = [
    { value: "cooking", label: "Cooking Session", icon: "🍳" },
    { value: "meal_prep", label: "Meal Prep", icon: "🥗" },
    { value: "grocery_shopping", label: "Grocery Shopping", icon: "🛒" },
    { value: "dinner_party", label: "Dinner Party", icon: "🍽️" },
    { value: "cooking_class", label: "Cooking Class", icon: "👨‍🍳" },
    { value: "restaurant_visit", label: "Restaurant Visit", icon: "🏪" }
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-orange-500" />
          Save to Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Event Type */}
        <div>
          <Label htmlFor="event-type">Event Type</Label>
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger>
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              {eventTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Event Title */}
        <div>
          <Label htmlFor="event-title">Event Title *</Label>
          <Input
            id="event-title"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            placeholder="Enter event title..."
            required
          />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="event-date">Date *</Label>
            <Input
              id="event-date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="start-time">Start Time *</Label>
            <Input
              id="start-time"
              type="time"
              value={eventStartTime}
              onChange={(e) => setEventStartTime(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="end-time">End Time *</Label>
            <Input
              id="end-time"
              type="time"
              value={eventEndTime}
              onChange={(e) => setEventEndTime(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <Label htmlFor="event-location">Location</Label>
          <Input
            id="event-location"
            value={eventLocation}
            onChange={(e) => setEventLocation(e.target.value)}
            placeholder="Enter location..."
            className="flex items-center"
          />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="event-description">Description</Label>
          <Textarea
            id="event-description"
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            placeholder="Add event details, ingredients needed, recipe notes..."
            rows={3}
          />
        </div>

        {/* Attendees */}
        <div>
          <Label htmlFor="attendees">Attendees (Optional)</Label>
          <Input
            id="attendees"
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
            placeholder="Add email addresses separated by commas..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button 
            onClick={saveToDeviceCalendar}
            className="flex-1 bg-orange-500 hover:bg-orange-600"
          >
            <Save className="h-4 w-4 mr-2" />
            Save to Calendar
          </Button>
          <Button 
            onClick={downloadCalendarFile}
            variant="outline"
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Download .ics File
          </Button>
        </div>

        {/* Quick Time Presets */}
        <div className="border-t pt-4">
          <Label className="text-sm font-medium text-gray-700">Quick Time Presets:</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            {[
              { label: "30 min", duration: 30 },
              { label: "1 hour", duration: 60 },
              { label: "2 hours", duration: 120 },
              { label: "3 hours", duration: 180 }
            ].map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                onClick={() => {
                  const start = new Date(`${eventDate}T${eventStartTime}:00`);
                  const end = new Date(start.getTime() + preset.duration * 60000);
                  setEventEndTime(end.toTimeString().slice(0, 5));
                }}
                className="text-xs"
              >
                <Clock className="h-3 w-3 mr-1" />
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}