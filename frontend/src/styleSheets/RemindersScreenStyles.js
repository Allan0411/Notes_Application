import { StyleSheet, Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop:24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#4a5568',
    borderBottomWidth: 1,
    borderBottomColor: '#4a5568',
    paddingTop: 20,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'left',
    justifyContent: 'left',
    paddingLeft: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#eff0f3ff',
  },
  // Search Styles
  searchContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    overflow: 'hidden',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    flex: 1,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 16,
    color: '#a5a7acff',
    backgroundColor: 'transparent',
  },
  
  // Tab Styles
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#edf3f8ff',
    borderBottomWidth: 1,
    borderBottomColor: '#edf3f8ff',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    position: 'relative',
    backgroundColor: '#e8eef7ff',
  },
  activeTab: {
    backgroundColor: '#5b6880ff',
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabBadge: {
    position: 'absolute',
    top: -2,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    backgroundColor: '#EF4444',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Content Styles
  contentContainer: {
    flex: 1,
    backgroundColor: '#edf3f8ff',
  },
  remindersContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  
  // Reminder Card Styles
  reminderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  urgentCard: {
    borderColor: '#FEE2E2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  completedCard: {
    opacity: 1.0,
    backgroundColor: '#eaeceeff',
  },
  cardTouchable: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flex: 1,
    paddingRight: 12,
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 22,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  statusBadgeContainer: {
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reminderTypeIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  typeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  cardContent: {
    gap: 8,
  },
  cardMessage: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
  },
  cardDateTime: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eaeceeff',
    marginTop: 4,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
    color: '#4B5563',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#eaeceeff',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  completeButton: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },
  completeButtonText: {
    color: '#16A34A',
  },
  deleteButtonText: {
    color: '#DC2626',
  },
  
  // Empty State Styles
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateContent: {
    alignItems: 'center',
    maxWidth: 280,
  },
  emptyStateIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    color: '#111827',
  },
  emptyStateMessage: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: '#6B7280',
  },
  // Status Colors
  statusActive: {
    backgroundColor: '#EFF6FF',
    color: '#2563EB',
  },
  statusCompleted: {
    backgroundColor: '#F0FDF4',
    color: '#16A34A',
  },
  statusOverdue: {
    backgroundColor: '#FEF2F2',
    color: '#DC2626',
  },
  statusUrgent: {
    backgroundColor: '#FEF3C7',
    color: '#D97706',
  },
});

export default styles;