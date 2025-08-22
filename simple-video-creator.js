import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

class SimpleVideoCreator {
    constructor() {
        this.width = 430;
        this.height = 932;
        this.outputDir = './video-frames';
        this.videoPath = './ChefGrocer-App-Preview.mp4';
    }

    async createVideo() {
        console.log('🎬 Creating ChefGrocer App Store Preview Video...');
        
        // Create output directory
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir);
        }

        // Generate all frames
        await this.generateAllFrames();
        
        // Combine into video
        console.log('🎞️ Combining frames into video...');
        await this.combineFramesToVideo();
        
        console.log('✅ Video created successfully: ChefGrocer-App-Preview.mp4');
    }

    async generateAllFrames() {
        const frames = [
            // Hero frames (0-4)
            { title: 'ChefGrocer', emoji: '👨‍🍳', main: 'ChefGrocer', sub: 'AI-Powered Kitchen Assistant', color: '#4f46e5' },
            { title: 'ChefGrocer', emoji: '👨‍🍳', main: 'ChefGrocer', sub: 'Voice Commands Ready', color: '#7c3aed' },
            { title: 'ChefGrocer', emoji: '🎯', main: 'Smart Cooking', sub: 'AI-Powered Assistance', color: '#ec4899' },
            { title: 'ChefGrocer', emoji: '🛒', main: 'Smart Shopping', sub: 'Real Store Locations', color: '#06b6d4' },
            { title: 'ChefGrocer', emoji: '🎤', main: 'Voice Control', sub: 'Hands-Free Cooking', color: '#8b5cf6' },
            
            // Voice cooking frames (5-9)
            { title: 'Voice Cooking', emoji: '🎤', main: 'Voice Cooking', sub: 'Hands-free AI guidance', type: 'feature' },
            { title: 'Voice Cooking', emoji: '⚫', main: 'Listening...', sub: 'Voice command active', type: 'listening' },
            { title: 'Voice Cooking', emoji: '💬', main: 'You said:', sub: '"What\'s the next step?"', type: 'user' },
            { title: 'Voice Cooking', emoji: '🤖', main: 'ChefGrocer says:', sub: '"Add cream and simmer!"', type: 'ai' },
            { title: 'Voice Cooking', emoji: '⏰', main: 'Timer: 2:45', sub: 'Simmering cream sauce', type: 'timer' },
            
            // Recipe frames (10-14)
            { title: 'Recipe Discovery', emoji: '🍝', main: '500,000+ Recipes', sub: 'Search anything...', type: 'recipe' },
            { title: 'Recipe Discovery', emoji: '🍝', main: 'Creamy Garlic Pasta', sub: '⭐ 4.8 • ⏱️ 20 min', type: 'recipe' },
            { title: 'Recipe Discovery', emoji: '🍝', main: 'Creamy Garlic Pasta', sub: '💰 $12.50 total cost', type: 'recipe' },
            { title: 'Recipe Discovery', emoji: '🥗', main: 'Mediterranean Bowl', sub: '⭐ 4.9 • ⏱️ 15 min', type: 'recipe' },
            { title: 'Recipe Discovery', emoji: '🥗', main: 'Mediterranean Bowl', sub: '💰 $8.75 total cost', type: 'recipe' },
            
            // Store locator frames (15-19)
            { title: 'Store Locator', emoji: '📍', main: 'Nearby Stores', sub: 'Real OpenStreetMap data', type: 'store' },
            { title: 'Store Locator', emoji: '🏪', main: 'Walmart Supercenter', sub: '0.8 miles • Open 24/7', type: 'store' },
            { title: 'Store Locator', emoji: '🏪', main: 'Hy-Vee Food Store', sub: '1.2 miles • 6am-11pm', type: 'store' },
            { title: 'Store Locator', emoji: '🏪', main: 'ALDI', sub: '1.8 miles • Budget prices', type: 'store' },
            { title: 'Store Locator', emoji: '🧭', main: 'Get Directions', sub: 'Navigate to any store', type: 'store' },
            
            // Pricing frames (20-24)
            { title: 'Premium Plans', emoji: '✨', main: 'Choose Your Plan', sub: 'Unlock full potential', type: 'pricing' },
            { title: 'Premium Plans', emoji: '💎', main: 'Premium', sub: '$4.99/month', type: 'pricing' },
            { title: 'Premium Plans', emoji: '💎', main: 'Premium Features', sub: 'Voice • AI • Nutrition', type: 'pricing' },
            { title: 'Premium Plans', emoji: '👑', main: 'Lifetime Pass', sub: '$99.99 once', type: 'pricing' },
            { title: 'Premium Plans', emoji: '👑', main: 'Best Value', sub: 'All features forever', type: 'pricing' },
            
            // CTA frames (25-29)
            { title: 'Download Now', emoji: '🚀', main: 'Start Cooking Smarter', sub: '500,000+ Recipes', type: 'cta' },
            { title: 'Download Now', emoji: '🚀', main: 'Start Cooking Smarter', sub: 'Voice AI Guidance', type: 'cta' },
            { title: 'Download Now', emoji: '🚀', main: 'Start Cooking Smarter', sub: 'Real Store Locations', type: 'cta' },
            { title: 'Download Now', emoji: '🚀', main: 'Start Cooking Smarter', sub: 'Smart Shopping', type: 'cta' },
            { title: 'Download Now', emoji: '📱', main: 'Download ChefGrocer', sub: 'Available now', type: 'cta' }
        ];

        for (let i = 0; i < frames.length; i++) {
            console.log(`📱 Generating frame ${i + 1}/30...`);
            await this.generateFrame(frames[i], i + 1);
        }
    }

    async generateFrame(frame, frameNumber) {
        const canvas = createCanvas(this.width, this.height);
        const ctx = canvas.getContext('2d');

        // Phone frame
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Phone screen
        const screenX = 8;
        const screenY = 8;
        const screenWidth = this.width - 16;
        const screenHeight = this.height - 16;
        
        ctx.fillStyle = '#ffffff';
        this.roundRect(ctx, screenX, screenY, screenWidth, screenHeight, 42);
        ctx.fill();

        // Status bar
        const gradient = ctx.createLinearGradient(0, 0, screenWidth, 0);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        this.roundRect(ctx, screenX, screenY, screenWidth, 44, 42, true);
        ctx.fill();

        // Status bar text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillText('9:41', screenX + 20, screenY + 28);
        ctx.textAlign = 'center';
        ctx.fillText(frame.title, this.width / 2, screenY + 28);
        ctx.textAlign = 'right';
        ctx.fillText('100%', screenX + screenWidth - 20, screenY + 28);

        // Content area
        const contentY = screenY + 44;
        const contentHeight = screenHeight - 44;

        // Background gradient for content
        const contentGradient = ctx.createLinearGradient(0, contentY, 0, contentY + contentHeight);
        contentGradient.addColorStop(0, frame.color || '#4f46e5');
        contentGradient.addColorStop(0.5, '#7c3aed');
        contentGradient.addColorStop(1, '#ec4899');
        ctx.fillStyle = contentGradient;
        ctx.fillRect(screenX, contentY, screenWidth, contentHeight);

        // Content
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        
        // Emoji
        ctx.font = '96px Arial';
        ctx.fillText(frame.emoji, this.width / 2, contentY + 150);

        // Main text
        ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, sans-serif';
        this.wrapText(ctx, frame.main, this.width / 2, contentY + 250, screenWidth - 80, 60);

        // Sub text
        ctx.font = '24px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.globalAlpha = 0.9;
        this.wrapText(ctx, frame.sub, this.width / 2, contentY + 340, screenWidth - 80, 32);
        ctx.globalAlpha = 1;

        // Type-specific elements
        if (frame.type === 'listening') {
            // Red dot for listening
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(this.width / 2 - 60, contentY + 420, 8, 0, 2 * Math.PI);
            ctx.fill();
        }

        if (frame.type === 'pricing') {
            // Price highlight box
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            this.roundRect(ctx, screenX + 40, contentY + 400, screenWidth - 80, 80, 20);
            ctx.fill();
        }

        if (frame.type === 'cta') {
            // CTA button
            ctx.fillStyle = '#ffffff';
            this.roundRect(ctx, screenX + 60, contentY + 450, screenWidth - 120, 60, 30);
            ctx.fill();
            
            ctx.fillStyle = frame.color || '#4f46e5';
            ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.fillText('Download Now', this.width / 2, contentY + 485);
        }

        // Save frame
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(`${this.outputDir}/frame-${String(frameNumber).padStart(2, '0')}.png`, buffer);
    }

    roundRect(ctx, x, y, width, height, radius, topOnly = false) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        
        if (topOnly) {
            ctx.lineTo(x + width, y + height);
            ctx.lineTo(x, y + height);
        } else {
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        }
        
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let testLine = '';
        let metrics = null;
        let testWidth = 0;

        for (let n = 0; n < words.length; n++) {
            testLine = line + words[n] + ' ';
            metrics = ctx.measureText(testLine);
            testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, y);
    }

    async combineFramesToVideo() {
        return new Promise((resolve, reject) => {
            ffmpeg()
                .input(`${this.outputDir}/frame-%02d.png`)
                .inputFPS(1)
                .videoCodec('libx264')
                .outputOptions([
                    '-pix_fmt yuv420p',
                    '-r 30'
                ])
                .size('430x932')
                .duration(30)
                .output(this.videoPath)
                .on('end', () => {
                    console.log('✅ Video processing completed');
                    this.cleanupFrames();
                    resolve();
                })
                .on('error', (err) => {
                    console.error('❌ Video processing failed:', err);
                    reject(err);
                })
                .run();
        });
    }

    cleanupFrames() {
        if (fs.existsSync(this.outputDir)) {
            fs.readdirSync(this.outputDir).forEach(file => {
                fs.unlinkSync(`${this.outputDir}/${file}`);
            });
            fs.rmdirSync(this.outputDir);
        }
    }
}

// Run the creator
async function main() {
    try {
        const creator = new SimpleVideoCreator();
        await creator.createVideo();
    } catch (error) {
        console.error('❌ Error creating video:', error);
        process.exit(1);
    }
}

main();