import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { NotificationItem } from '@/components/notification/NotificationItem';
import { Button } from '@/components/ui/button';
import { NotificationDTO } from '@/types/notification.types';
import { notificationService } from '@/services/notificationsService';
import { useNotifications } from '@/contexts/NotificationsContext';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, ChevronRight, Bell } from 'lucide-react';

const NOTIFICATIONS_PER_PAGE = 20;

export default function NotificationsPage() {
    const { user } = useAuth();
    const userId = user?.id;
    const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalNotifications, setTotalNotifications] = useState(0);
    const [loading, setLoading] = useState(true);
    const { refreshUnreadCount } = useNotifications();

    const totalPages = Math.ceil(totalNotifications / NOTIFICATIONS_PER_PAGE);

    useEffect(() => {
        if (userId !== undefined) {
            loadNotifications();
        }
    }, [currentPage, userId]);

    const loadNotifications = async () => {
        try {
            setLoading(true);

            const pageData = await notificationService.fetchNotificationsPage(
                userId!,
                currentPage,
                NOTIFICATIONS_PER_PAGE
            );

            setNotifications(pageData.content);
            setTotalNotifications(pageData.totalElements);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (notificationId: number) => {
        try {
            await notificationService.markNotificationRead(notificationId);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
            );
            await refreshUnreadCount();
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllNotificationsRead(userId!);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            await refreshUnreadCount();
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    // If no user, show nothing or redirect
    if (!userId) {
        return null;
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Modern Header with gradient */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 p-8 mb-8 border border-border/10">
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-foreground mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                Notifications
                            </h1>
                            <p className="text-muted-foreground">Stay updated with your latest activities</p>
                        </div>
                        <Button
                            onClick={handleMarkAllRead}
                            variant="default"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 px-6"
                        >
                            Mark all as read
                        </Button>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/20 to-transparent rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-2xl"></div>
                </div>

                {/* Notifications List with modern design */}
                <div className="bg-background/60 backdrop-blur-xl border border-border/10 rounded-2xl shadow-xl overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="w-12 h-12 mx-auto mb-4 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            <p className="text-muted-foreground font-medium">Loading notifications...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/10 flex items-center justify-center">
                                <Bell className="w-10 h-10 text-muted-foreground/50" />
                            </div>
                            <p className="text-lg font-medium text-foreground mb-2">No notifications found</p>
                            <p className="text-muted-foreground">You're all caught up!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/5">
                            {notifications.map(notification => (
                                <div key={notification.id} className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                                    <NotificationItem
                                        notification={notification}
                                        onMarkRead={handleMarkRead}
                                        showMarkAsRead={true}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modern Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-8 p-6 bg-background/40 backdrop-blur-xl border border-border/10 rounded-2xl">
                        <Button
                            variant="outline"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 0}
                            className="flex items-center space-x-2 hover:bg-primary/10 hover:border-primary/20 transition-all duration-200"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span>Previous</span>
                        </Button>

                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-muted-foreground font-medium">
                                Page <span className="text-foreground font-semibold">{currentPage + 1}</span> of <span className="text-foreground font-semibold">{totalPages}</span>
                            </span>
                            <div className="w-px h-4 bg-border"></div>
                            <span className="text-sm text-muted-foreground">
                                <span className="text-foreground font-medium">{totalNotifications}</span> total notifications
                            </span>
                        </div>

                        <Button
                            variant="outline"
                            onClick={handleNextPage}
                            disabled={currentPage >= totalPages - 1}
                            className="flex items-center space-x-2 hover:bg-primary/10 hover:border-primary/20 transition-all duration-200"
                        >
                            <span>Next</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </Layout>
    );
}