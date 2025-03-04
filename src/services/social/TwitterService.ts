import { SocialAccount } from '../../types/SocialAccount';

export class TwitterApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'TwitterApiError';
    this.statusCode = statusCode;
  }
}

export interface TwitterUser {
  id: string;
  name: string;
  username: string;
  profile_image_url: string;
}

export interface TwitterTweet {
  id: string;
  text: string;
  created_at: string;
}

export class TwitterService {
  private accessToken: string;
  
  constructor(account: SocialAccount) {
    if (account.platform !== 'twitter') {
      throw new Error('Invalid account type');
    }
    this.accessToken = account.accessToken;
  }
  
  /**
   * Gets the user profile information
   */
  async getUserProfile(): Promise<TwitterUser> {
    console.log('Fetching Twitter user profile...');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock response
    const mockProfile: TwitterUser = {
      id: 'mock-twitter-user-id',
      name: 'Ubikial Test User',
      username: 'ubikial_test',
      profile_image_url: 'https://pbs.twimg.com/profile_images/mock/ubikial_test.jpg'
    };
    
    return mockProfile;
  }
  
  /**
   * Posts a tweet
   */
  async postTweet(text: string, mediaIds?: string[]): Promise<TwitterTweet> {
    console.log('Posting tweet:', text, mediaIds);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Validate tweet length
    if (text.length > 280) {
      throw new TwitterApiError('Tweet exceeds 280 characters', 400);
    }
    
    // Mock response
    const mockTweet: TwitterTweet = {
      id: `tweet-${Date.now()}`,
      text,
      created_at: new Date().toISOString()
    };
    
    return mockTweet;
  }
  
  /**
   * Creates a thread of tweets
   */
  async createThread(tweets: string[]): Promise<TwitterTweet[]> {
    console.log('Creating Twitter thread with', tweets.length, 'tweets');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock thread responses
    return tweets.map((text, index) => ({
      id: `tweet-thread-${Date.now()}-${index}`,
      text,
      created_at: new Date().toISOString()
    }));
  }
  
  /**
   * Uploads media for a tweet
   */
  async uploadMedia(file: File): Promise<string> {
    console.log('Uploading media to Twitter:', file.name);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock media ID
    return `media-${Date.now()}`;
  }
  
  /**
   * Retrieves recent tweets for the user
   */
  async getRecentTweets(count: number = 10): Promise<TwitterTweet[]> {
    console.log('Fetching recent tweets, count:', count);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Generate mock tweets
    return Array.from({ length: count }, (_, i) => ({
      id: `tweet-${Date.now()}-${i}`,
      text: `This is a mock tweet #${i + 1} for testing the Twitter API integration.`,
      created_at: new Date(Date.now() - i * 3600000).toISOString()
    }));
  }
}
