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
    const { user, isAuthenticated } = useAuth();
    const userId = user?.id;
    const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalNotifications, setTotalNotifications] = useState(0);
    const [loading, setLoading] = useState(true);
    
    // Only use notifications context when user is authenticated
    const notificationsContext = isAuthenticated && user ? useNotifications() : null;
    const refreshUnreadCount = notificationsContext?.refreshUnreadCount;

    const totalPages = Math.ceil(totalNotifications / NOTIFICATIONS_PER_PAGE);

    useEffect(() => {
        if (userId !== undefined) {
            loadNotifications();
        }
    }, [currentPage, userId]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            // console.debug('Loading notifications for userId:', userId, 'currentPage:', currentPage);

            const pageData = await notificationService.fetchNotificationsPage(
                userId!,
                currentPage,
                NOTIFICATIONS_PER_PAGE
            );

            // console.debug('Received pageData:', pageData);
            // console.debug('Notifications content:', pageData.content);
            // console.debug('Total elements:', pageData.totalElements);

            setNotifications(pageData.content);
            setTotalNotifications(pageData.totalElements);
        } catch (error) {
            // console.error('Failed to fetch notifications:', error);
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
            if (refreshUnreadCount) {
                await refreshUnreadCount();
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllNotificationsRead(userId!);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            if (refreshUnreadCount) {
                await refreshUnreadCount();
            }
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
                {/* Enhanced Modern Header */}
                <div className="mb-12 text-center">
                    <div className="relative inline-block mb-6">
                        <h1 className="font-montserrat font-bold text-5xl text-[#2c3e50] mb-4">
                            Notifications
                        </h1>
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-[#3498db] to-[#2c3e50] rounded-full"></div>
                    </div>
                    <p className="font-roboto text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
                        Stay updated with your latest activities and important updates
                    </p>
                    
                    {/* Enhanced Action Button */}
                    <Button
                        onClick={handleMarkAllRead}
                        className="group relative overflow-hidden bg-gradient-to-r from-[#3498db] to-[#2c3e50] hover:from-[#2c3e50] hover:to-[#3498db] text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 rounded-full font-montserrat font-semibold transform hover:scale-105"
                        disabled={notifications.filter(n => !n.isRead).length === 0}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative">Mark All as Read</span>
                    </Button>
                </div>

                {/* Enhanced Notifications List */}
                <div className="relative overflow-hidden bg-white/95 backdrop-blur-xl border-0 rounded-2xl shadow-2xl">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50" />
                    
                    <div className="relative">
                        {loading ? (
                            <div className="flex flex-col justify-center items-center py-20">
                                <div className="relative mb-6">
                                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#3498db]"></div>
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#3498db]/10 to-transparent"></div>
                                </div>
                                <span className="text-gray-600 font-roboto text-lg">Loading notifications...</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 px-4">
                                <div className="relative mb-8">
                                    <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center shadow-lg">
                                        <div className="w-24 h-24 bg-gradient-to-br from-[#3498db]/20 to-[#2c3e50]/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                                            <Bell className="h-12 w-12 text-[#3498db]" />
                                        </div>
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full opacity-70 animate-pulse"></div>
                                    <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full opacity-60 animate-pulse delay-300"></div>
                                </div>
                                <h3 className="font-montserrat font-bold text-2xl text-[#2c3e50] mb-3 text-center">
                                    All Caught Up!
                                </h3>
                                <p className="font-roboto text-gray-600 text-center max-w-md leading-relaxed">
                                    No notifications to show. You're up to date with all your activities.
                                </p>
                                <div className="mt-6 w-20 h-1 bg-gradient-to-r from-[#3498db] to-[#2c3e50] rounded-full"></div>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/20">
                                {notifications.map(notification => (
                                    <div key={notification.id} className="relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
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
                </div>

                {/* Enhanced Modern Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 p-6 bg-white/95 backdrop-blur-xl border-0 rounded-2xl shadow-lg">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 rounded-2xl" />
                        <div className="relative flex items-center justify-between">
                            <Button
                                variant="outline"
                                onClick={handlePreviousPage}
                                disabled={currentPage === 0}
                                className="group flex items-center space-x-2 hover:bg-[#3498db]/10 hover:border-[#3498db]/20 transition-all duration-300 rounded-full px-6 py-3 font-montserrat font-medium backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                            >
                                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                <span>Previous</span>
                            </Button>

                            <div className="flex items-center space-x-6 bg-white/40 backdrop-blur-sm rounded-full px-6 py-3">
                                <span className="text-sm text-gray-600 font-roboto font-medium">
                                    Page <span className="text-[#2c3e50] font-bold">{currentPage + 1}</span> of <span className="text-[#2c3e50] font-bold">{totalPages}</span>
                                </span>
                                <div className="w-px h-4 bg-gray-300"></div>
                                <span className="text-sm text-gray-600 font-roboto">
                                    <span className="text-[#2c3e50] font-semibold">{totalNotifications}</span> total
                                </span>
                            </div>

                            <Button
                                variant="outline"
                                onClick={handleNextPage}
                                disabled={currentPage >= totalPages - 1}
                                className="group flex items-center space-x-2 hover:bg-[#3498db]/10 hover:border-[#3498db]/20 transition-all duration-300 rounded-full px-6 py-3 font-montserrat font-medium backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                            >
                                <span>Next</span>
                                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}