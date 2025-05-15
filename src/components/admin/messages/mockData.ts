
import { Conversation } from './types';

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    user: {
      id: 'user1',
      name: 'Mehmet Yılmaz',
      avatar: '',
    },
    lastMessage: {
      text: 'Merhaba! Bodrum\'daki teknenizi kiralamak istiyorum.',
      timestamp: '14:25',
      isRead: false,
    },
    unreadCount: 3,
  },
  {
    id: '2',
    user: {
      id: 'user2',
      name: 'Ayşe Kaya',
      avatar: '',
    },
    lastMessage: {
      text: 'Ödemeyi yaptım, onaylandı mı acaba?',
      timestamp: '12:30',
      isRead: true,
    },
    unreadCount: 0,
  },
  {
    id: '3',
    user: {
      id: 'user3',
      name: 'John Smith',
      avatar: '',
    },
    lastMessage: {
      text: 'Is the yacht available on July 15?',
      timestamp: 'Dün',
      isRead: false,
    },
    unreadCount: 1,
  },
  {
    id: '4',
    user: {
      id: 'user4',
      name: 'Deniz Korkmaz',
      avatar: '',
    },
    lastMessage: {
      text: 'Teşekkürler, harika bir deneyimdi!',
      timestamp: 'Pzt',
      isRead: true,
    },
    unreadCount: 0,
  },
  {
    id: '5',
    user: {
      id: 'user5',
      name: 'Ali Yıldız',
      avatar: '',
    },
    lastMessage: {
      text: 'Fiyatlandırma hakkında bilgi alabilir miyim?',
      timestamp: 'Pzt',
      isRead: true,
    },
    unreadCount: 0,
  },
  {
    id: '6',
    user: {
      id: 'user6',
      name: 'Maria Garcia',
      avatar: '',
    },
    lastMessage: {
      text: 'Can we arrange a tour for next weekend?',
      timestamp: 'Paz',
      isRead: true,
    },
    unreadCount: 0,
  },
  {
    id: '7',
    user: {
      id: 'user7',
      name: 'Kemal Özkan',
      avatar: '',
    },
    lastMessage: {
      text: 'Rezervasyon tarihini değiştirmek mümkün mü?',
      timestamp: '5 Nis',
      isRead: true,
    },
    unreadCount: 0,
  },
  {
    id: '8',
    user: {
      id: 'user8',
      name: 'Zeynep Şahin',
      avatar: '',
    },
    lastMessage: {
      text: 'Gönderdiğiniz fotoğraflar çok güzel, teşekkürler.',
      timestamp: '2 Nis',
      isRead: true,
    },
    unreadCount: 0,
  },
];
