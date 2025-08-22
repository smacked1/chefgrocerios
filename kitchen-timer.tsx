import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Timer, 
  Coffee, 
  ChefHat, 
  Flame, 
  Snowflake,
  Sun,
  Moon,
  Heart,
  Zap,
  Music,
  Volume2,
  VolumeX
} from 'lucide-react';

interface TimerTheme {
  id: string;
  name: string;
  emoji: string;
  icon: React.ReactNode;
  background: string;
  accent: string;
  textColor: string;
  description: string;
  sounds: {
    tick: string;
    alarm: string;
  };
  motivationalMessages: string[];
}

const timerThemes: TimerTheme[] = [
  {
    id: 'energetic',
    name: 'Energetic Chef',
    emoji: '🔥',
    icon: <Flame className="h-5 w-5" />,
    background: 'bg-gradient-to-br from-orange-500 to-red-600',
    accent: 'bg-orange-600 hover:bg-orange-700',
    textColor: 'text-white',
    description: 'High-energy cooking vibes',
    sounds: {
      tick: 'energetic-tick',
      alarm: 'energetic-alarm'
    },
    motivationalMessages: [
      "You're cooking with fire! 🔥",
      "Keep that energy flowing!",
      "Master chef mode activated!",
      "Sizzling progress!"
    ]
  },
  {
    id: 'zen',
    name: 'Zen Kitchen',
    emoji: '🧘‍♀️',
    icon: <Moon className="h-5 w-5" />,
    background: 'bg-gradient-to-br from-blue-400 to-purple-500',
    accent: 'bg-blue-500 hover:bg-blue-600',
    textColor: 'text-white',
    description: 'Calm and mindful cooking',
    sounds: {
      tick: 'zen-tick',
      alarm: 'zen-bell'
    },
    motivationalMessages: [
      "Breathe and cook mindfully 🧘‍♀️",
      "Patience creates perfection",
      "Find your inner chef",
      "Cooking is meditation"
    ]
  },
  {
    id: 'cozy',
    name: 'Cozy Home',
    emoji: '🏠',
    icon: <Heart className="h-5 w-5" />,
    background: 'bg-gradient-to-br from-amber-400 to-orange-500',
    accent: 'bg-amber-500 hover:bg-amber-600',
    textColor: 'text-white',
    description: 'Warm, homestyle cooking',
    sounds: {
      tick: 'cozy-tick',
      alarm: 'cozy-chime'
    },
    motivationalMessages: [
      "Home is where the heart is ❤️",
      "Cooking with love",
      "Creating memories in the kitchen",
      "Comfort food vibes"
    ]
  },
  {
    id: 'professional',
    name: 'Pro Kitchen',
    emoji: '👨‍🍳',
    icon: <ChefHat className="h-5 w-5" />,
    background: 'bg-gradient-to-br from-gray-800 to-gray-900',
    accent: 'bg-gray-700 hover:bg-gray-600',
    textColor: 'text-white',
    description: 'Professional chef precision',
    sounds: {
      tick: 'professional-tick',
      alarm: 'professional-alarm'
    },
    motivationalMessages: [
      "Precision timing, chef! 👨‍🍳",
      "Professional standards maintained",
      "Excellence in every second",
      "Kitchen mastery in progress"
    ]
  },
  {
    id: 'tropical',
    name: 'Tropical Vibes',
    emoji: '🌴',
    icon: <Sun className="h-5 w-5" />,
    background: 'bg-gradient-to-br from-green-400 to-teal-500',
    accent: 'bg-green-500 hover:bg-green-600',
    textColor: 'text-white',
    description: 'Fresh, tropical cooking energy',
    sounds: {
      tick: 'tropical-tick',
      alarm: 'tropical-chime'
    },
    motivationalMessages: [
      "Island cooking vibes! 🌴",
      "Fresh ingredients, fresh energy",
      "Tropical flavors incoming",
      "Sunshine in the kitchen"
    ]
  },
  {
    id: 'midnight',
    name: 'Midnight Snack',
    emoji: '🌙',
    icon: <Moon className="h-5 w-5" />,
    background: 'bg-gradient-to-br from-indigo-900 to-purple-900',
    accent: 'bg-indigo-600 hover:bg-indigo-700',
    textColor: 'text-white',
    description: 'Late night cooking session',
    sounds: {
      tick: 'soft-tick',
      alarm: 'gentle-chime'
    },
    motivationalMessages: [
      "Late night cooking magic 🌙",
      "Midnight chef at work",
      "Quiet kitchen, big flavors",
      "Night owl cooking session"
    ]
  }
];

interface PresetTimer {
  name: string;
  minutes: number;
  emoji: string;
  description: string;
}

const presetTimers: PresetTimer[] = [
  { name: 'Soft Boiled Egg', minutes: 6, emoji: '🥚', description: 'Perfect runny yolk' },
  { name: 'Hard Boiled Egg', minutes: 12, emoji: '🥚', description: 'Firm yolk' },
  { name: 'Pasta Al Dente', minutes: 8, emoji: '🍝', description: 'Perfect texture' },
  { name: 'Rice Cooking', minutes: 18, emoji: '🍚', description: 'Fluffy rice' },
  { name: 'Steak Rest', minutes: 5, emoji: '🥩', description: 'Let juices settle' },
  { name: 'Bread Proof', minutes: 45, emoji: '🍞', description: 'First rise' },
  { name: 'Tea Steep', minutes: 3, emoji: '🍵', description: 'Perfect brew' },
  { name: 'Coffee Brew', minutes: 4, emoji: '☕', description: 'French press' },
  { name: 'Pizza Bake', minutes: 12, emoji: '🍕', description: 'Crispy crust' },
  { name: 'Cookie Bake', minutes: 10, emoji: '🍪', description: 'Golden brown' }
];

export const KitchenTimer = () => {
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(timerThemes[0]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showMotivation, setShowMotivation] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio context for timer sounds
  useEffect(() => {
    if (soundEnabled) {
      // Create audio context for web audio API sounds
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        // Store for later use with Web Audio API
      } catch (error) {
        console.log('Web Audio not supported, using fallback');
      }
    }
  }, [soundEnabled]);

  // Timer countdown logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            handleTimerComplete();
            return 0;
          }
          
          // Play tick sound every second if enabled
          if (soundEnabled && prevTime % 10 === 0) {
            playTickSound();
          }
          
          // Show motivational message at 50% and 25% remaining
          const totalTime = minutes * 60 + seconds;
          if (prevTime === Math.floor(totalTime * 0.5) || prevTime === Math.floor(totalTime * 0.25)) {
            showRandomMotivation();
          }
          
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, soundEnabled, minutes, seconds]);

  const playTickSound = () => {
    if (!soundEnabled) return;
    
    // Generate tick sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Fallback to system beep
      console.log('Tick sound fallback');
    }
  };

  const playAlarmSound = () => {
    if (!soundEnabled) return;
    
    // Generate alarm sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Play a sequence of notes for alarm
      [440, 523, 659].forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = freq;
          oscillator.type = 'square';
          
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
        }, index * 200);
      });
    } catch (error) {
      // System notification sound fallback
      navigator.vibrate?.([200, 100, 200]);
    }
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    playAlarmSound();
    
    // Show completion notification
    toast({
      title: `Timer Complete! ${currentTheme.emoji}`,
      description: `Your ${minutes}:${seconds.toString().padStart(2, '0')} timer has finished!`,
    });

    // Show celebratory message
    setCurrentMessage("Timer complete! Great job! 🎉");
    setShowMotivation(true);
    setTimeout(() => setShowMotivation(false), 3000);

    // Browser notification if available and permission granted
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('Kitchen Timer Complete!', {
        body: `Your ${minutes}:${seconds.toString().padStart(2, '0')} timer has finished!`,
        icon: '/favicon.ico'
      });
    }
  };

  const showRandomMotivation = () => {
    const messages = currentTheme.motivationalMessages;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setCurrentMessage(randomMessage);
    setShowMotivation(true);
    setTimeout(() => setShowMotivation(false), 2000);
  };

  const startTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(minutes * 60 + seconds);
    }
    setIsRunning(true);
    
    // Request notification permission if available
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setShowMotivation(false);
  };

  const setPresetTimer = (preset: PresetTimer) => {
    setMinutes(preset.minutes);
    setSeconds(0);
    setTimeLeft(0);
    setIsRunning(false);
    
    toast({
      title: `${preset.name} Timer Set ${preset.emoji}`,
      description: preset.description,
    });
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = timeLeft > 0 ? ((timeLeft / (minutes * 60 + seconds)) * 100) : 0;

  return (
    <div className="space-y-6">
      <Card className={`${currentTheme.background} ${currentTheme.textColor} border-0 shadow-2xl`}>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {currentTheme.icon}
            <CardTitle className="text-2xl font-bold">
              Kitchen Timer {currentTheme.emoji}
            </CardTitle>
          </div>
          <CardDescription className={`${currentTheme.textColor} opacity-90`}>
            {currentTheme.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Timer Display */}
          <div className="text-center">
            <div className="text-6xl font-mono font-bold mb-4">
              {timeLeft > 0 ? formatTime(timeLeft) : `${minutes}:${seconds.toString().padStart(2, '0')}`}
            </div>
            
            {/* Progress Bar */}
            {timeLeft > 0 && (
              <div className="w-full bg-white bg-opacity-20 rounded-full h-3 mb-4">
                <div
                  className="bg-white h-3 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${100 - progress}%` }}
                />
              </div>
            )}
            
            {/* Motivational Message */}
            {showMotivation && (
              <div className="bg-white bg-opacity-20 rounded-lg p-3 mb-4 animate-bounce">
                <p className="text-lg font-medium">{currentMessage}</p>
              </div>
            )}
          </div>

          {/* Timer Controls */}
          <div className="flex justify-center gap-3">
            {!isRunning ? (
              <Button
                onClick={startTimer}
                size="lg"
                className={`${currentTheme.accent} ${currentTheme.textColor} shadow-lg hover:shadow-xl transition-all`}
              >
                <Play className="h-5 w-5 mr-2" />
                Start Timer
              </Button>
            ) : (
              <Button
                onClick={pauseTimer}
                size="lg"
                className={`${currentTheme.accent} ${currentTheme.textColor} shadow-lg hover:shadow-xl transition-all`}
              >
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </Button>
            )}
            
            <Button
              onClick={resetTimer}
              size="lg"
              variant="outline"
              className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-opacity-30"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Reset
            </Button>
            
            <Button
              onClick={() => setSoundEnabled(!soundEnabled)}
              size="lg"
              variant="outline"
              className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-opacity-30"
            >
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timer Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Timer Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Time Input */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minutes">Minutes</Label>
              <Input
                id="minutes"
                type="number"
                min="0"
                max="99"
                value={minutes}
                onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                disabled={isRunning}
              />
            </div>
            <div>
              <Label htmlFor="seconds">Seconds</Label>
              <Input
                id="seconds"
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(parseInt(e.target.value) || 0)}
                disabled={isRunning}
              />
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <Label htmlFor="theme">Timer Theme</Label>
            <Select
              value={currentTheme.id}
              onValueChange={(value) => {
                const theme = timerThemes.find(t => t.id === value);
                if (theme) setCurrentTheme(theme);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {timerThemes.map((theme) => (
                  <SelectItem key={theme.id} value={theme.id}>
                    <div className="flex items-center gap-2 py-1">
                      {theme.icon}
                      <span className="text-sm">{theme.name} {theme.emoji}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Preset Timers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Quick Presets
          </CardTitle>
          <CardDescription>
            Common cooking times for perfect results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {presetTimers.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => setPresetTimer(preset)}
                disabled={isRunning}
                className="flex flex-col items-center p-3 h-auto min-h-[85px] text-center hover:shadow-md transition-all"
              >
                <span className="text-xl mb-2">{preset.emoji}</span>
                <span className="text-xs font-medium mb-2 leading-tight">
                  {preset.name}
                </span>
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  {preset.minutes}m
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};