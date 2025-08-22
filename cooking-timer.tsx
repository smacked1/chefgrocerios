import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Play, Pause, Square, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Timer {
  id: string;
  name: string;
  duration: number;
  remaining: number;
  isActive: boolean;
  isPaused: boolean;
}

export function CookingTimer() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [newTimerName, setNewTimerName] = useState("");
  const [newTimerMinutes, setNewTimerMinutes] = useState(5);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio for timer completion sound
  useEffect(() => {
    // Create a pleasant timer completion sound using Web Audio API
    const createTimerSound = () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create a pleasant chime sound
        const playChime = () => {
          const oscillator1 = audioContext.createOscillator();
          const oscillator2 = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator1.connect(gainNode);
          oscillator2.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          // Pleasant cooking timer frequencies
          oscillator1.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator2.frequency.setValueAtTime(1000, audioContext.currentTime);
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);
          
          oscillator1.start(audioContext.currentTime);
          oscillator2.start(audioContext.currentTime);
          
          oscillator1.stop(audioContext.currentTime + 1.5);
          oscillator2.stop(audioContext.currentTime + 1.5);
        };
        
        return playChime;
      } catch (error) {
        console.warn("Web Audio API not supported, using fallback sound");
        return null;
      }
    };

    const soundPlayer = createTimerSound();
    
    // Store sound player function
    if (soundPlayer) {
      (window as any).playTimerSound = soundPlayer;
    }

    return () => {
      if ((window as any).playTimerSound) {
        delete (window as any).playTimerSound;
      }
    };
  }, []);

  // Timer countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prevTimers => 
        prevTimers.map(timer => {
          if (timer.isActive && !timer.isPaused && timer.remaining > 0) {
            const newRemaining = timer.remaining - 1;
            
            // Timer completed
            if (newRemaining === 0) {
              // Play timer completion sound
              if ((window as any).playTimerSound) {
                (window as any).playTimerSound();
              }
              
              // Show completion notification
              toast({
                title: "🔔 Timer Complete!",
                description: `"${timer.name}" timer has finished`,
                duration: 10000,
              });

              // Browser notification if permission granted
              if ("Notification" in window && Notification.permission === "granted") {
                new Notification(`Timer Complete: ${timer.name}`, {
                  body: "Your cooking timer has finished!",
                  icon: "/favicon.png",
                  tag: `timer-${timer.id}`
                });
              }
              
              return { ...timer, remaining: 0, isActive: false };
            }
            
            return { ...timer, remaining: newRemaining };
          }
          return timer;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [toast]);

  const addTimer = () => {
    if (!newTimerName.trim()) {
      toast({
        title: "Timer Name Required",
        description: "Please enter a name for your timer",
        variant: "destructive",
      });
      return;
    }

    const newTimer: Timer = {
      id: Date.now().toString(),
      name: newTimerName,
      duration: newTimerMinutes * 60,
      remaining: newTimerMinutes * 60,
      isActive: false,
      isPaused: false,
    };

    setTimers(prev => [...prev, newTimer]);
    setNewTimerName("");
    setNewTimerMinutes(5);
    
    toast({
      title: "Timer Added",
      description: `"${newTimerName}" timer ready to start`,
    });
  };

  const startTimer = (id: string) => {
    setTimers(prev => 
      prev.map(timer => 
        timer.id === id 
          ? { ...timer, isActive: true, isPaused: false }
          : timer
      )
    );

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  const pauseTimer = (id: string) => {
    setTimers(prev => 
      prev.map(timer => 
        timer.id === id 
          ? { ...timer, isPaused: !timer.isPaused }
          : timer
      )
    );
  };

  const stopTimer = (id: string) => {
    setTimers(prev => 
      prev.map(timer => 
        timer.id === id 
          ? { ...timer, isActive: false, isPaused: false, remaining: timer.duration }
          : timer
      )
    );
  };

  const removeTimer = (id: string) => {
    setTimers(prev => prev.filter(timer => timer.id !== id));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const testSound = () => {
    if ((window as any).playTimerSound) {
      (window as any).playTimerSound();
      toast({
        title: "🔊 Test Sound",
        description: "This is how your timer will sound when complete",
      });
    } else {
      toast({
        title: "Sound Test",
        description: "Timer sound will play when timers complete",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Add New Timer */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="text-orange-700 flex items-center gap-2">
            ⏰ Cooking Timer
            <Button 
              size="sm" 
              variant="outline" 
              onClick={testSound}
              className="ml-auto border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              <Volume2 className="w-4 h-4 mr-1" />
              Test Sound
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Timer name (e.g., 'Pasta boiling')"
              value={newTimerName}
              onChange={(e) => setNewTimerName(e.target.value)}
              className="flex-1 border-orange-200 focus:border-orange-400"
            />
            <Input
              type="number"
              placeholder="Minutes"
              value={newTimerMinutes}
              onChange={(e) => setNewTimerMinutes(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-24 border-orange-200 focus:border-orange-400"
              min="1"
              max="240"
            />
            <Button 
              onClick={addTimer}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Add Timer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Timers */}
      <div className="space-y-3">
        {timers.map(timer => (
          <Card 
            key={timer.id} 
            className={`border-2 ${
              timer.remaining === 0 
                ? 'border-red-300 bg-red-50' 
                : timer.isActive 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-orange-200'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-orange-700">{timer.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-mono ${
                      timer.remaining === 0 
                        ? 'text-red-600' 
                        : timer.isActive 
                          ? 'text-green-600' 
                          : 'text-orange-600'
                    }`}>
                      {formatTime(timer.remaining)}
                    </span>
                    {timer.remaining === 0 && (
                      <span className="text-red-600 font-bold animate-pulse">DONE!</span>
                    )}
                    {timer.isActive && timer.isPaused && (
                      <span className="text-yellow-600 text-sm">PAUSED</span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-1">
                  {!timer.isActive ? (
                    <Button
                      size="sm"
                      onClick={() => startTimer(timer.id)}
                      disabled={timer.remaining === 0}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => pauseTimer(timer.id)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      <Pause className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    onClick={() => stopTimer(timer.id)}
                    variant="outline"
                    className="border-orange-300 text-orange-600 hover:bg-orange-50"
                  >
                    <Square className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => removeTimer(timer.id)}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {timers.length === 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6 text-center">
            <p className="text-orange-600">No active timers. Add one above to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}