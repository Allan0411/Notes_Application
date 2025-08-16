// StatsNotesListStyleSheet.js

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 40,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { height: 1 },
    elevation: 2,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  },
  statsContainer: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { height: 1 },
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 24,
    marginHorizontal: 16,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  warningText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  noteCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { height: 2 },
    elevation: 3,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  noteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  noteDetails: {
    flex: 1,
  },
  noteTypeIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteDate: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  expiryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  miniActions: {
    flexDirection: 'row',
    gap: 8,
  },
  miniActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notePreview: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: '400',
  },
  contentIndicators: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  indicatorText: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default styles;
