// Analytics and event tracking
interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
}

class Analytics {
  private static instance: Analytics;
  private queue: AnalyticsEvent[] = [];
  private isInitialized = false;

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  initialize(): void {
    if (this.isInitialized) return;
    
    // Initialize analytics in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Initialize Google Analytics, Mixpanel, or other analytics service
      this.processQueue();
    }
    
    this.isInitialized = true;
  }

  track(event: Omit<AnalyticsEvent, 'event'> & { event?: string }): void {
    const analyticsEvent: AnalyticsEvent = {
      event: event.event || `${event.category}_${event.action}`,
      ...event
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics event:', analyticsEvent);
    }

    if (this.isInitialized) {
      this.sendEvent(analyticsEvent);
    } else {
      this.queue.push(analyticsEvent);
    }
  }

  private processQueue(): void {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) {
        this.sendEvent(event);
      }
    }
  }

  private sendEvent(event: AnalyticsEvent): void {
    // TODO: Implement actual analytics sending
    // Example for Google Analytics:
    // gtag('event', event.action, {
    //   event_category: event.category,
    //   event_label: event.label,
    //   value: event.value,
    //   ...event.properties
    // });
  }

  // Convenience methods for common events
  trackPageView(page: string): void {
    this.track({
      category: 'Navigation',
      action: 'page_view',
      label: page
    });
  }

  trackUserAction(action: string, label?: string, value?: number): void {
    this.track({
      category: 'User',
      action,
      label,
      value
    });
  }

  trackError(error: string, context?: string): void {
    this.track({
      category: 'Error',
      action: 'error_occurred',
      label: error,
      properties: { context }
    });
  }

  trackPerformance(metric: string, value: number): void {
    this.track({
      category: 'Performance',
      action: 'metric_recorded',
      label: metric,
      value
    });
  }

  trackSubscription(plan: string, action: 'started' | 'completed' | 'cancelled'): void {
    this.track({
      category: 'Subscription',
      action,
      label: plan
    });
  }

  trackSearch(query: string, results: number, source: string): void {
    this.track({
      category: 'Search',
      action: 'search_performed',
      label: query,
      value: results,
      properties: { source }
    });
  }
}

export const analytics = Analytics.getInstance();