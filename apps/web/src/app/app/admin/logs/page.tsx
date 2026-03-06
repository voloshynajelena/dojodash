'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Container, Title, Text, Card, Table, Badge, Select, Group, Loader, Center
} from '@mantine/core';
import { getGlobalAuditLogs } from '@dojodash/firebase';
import type { AuditLog } from '@dojodash/core';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string | null>('All');
  const [filterType, setFilterType] = useState<string | null>('All');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const logsData = await getGlobalAuditLogs(100);
      setLogs(logsData);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const uniqueActions = useMemo(() => {
    const actions = new Set(logs.map((log) => log.action));
    return ['All', ...Array.from(actions)];
  }, [logs]);

  const uniqueTypes = useMemo(() => {
    const types = new Set(logs.map((log) => log.entityType));
    return ['All', ...Array.from(types)];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filterAction !== 'All' && log.action !== filterAction) return false;
      if (filterType !== 'All' && log.entityType !== filterType) return false;
      return true;
    });
  }, [logs, filterAction, filterType]);

  const formatTimestamp = (timestamp?: { seconds: number; nanoseconds: number }) => {
    if (!timestamp?.seconds) return 'Unknown';
    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getActionColor = (action: string) => {
    if (action.includes('created') || action.includes('CREATE')) return 'green';
    if (action.includes('deleted') || action.includes('DELETE')) return 'red';
    if (action.includes('updated') || action.includes('UPDATE')) return 'blue';
    return 'gray';
  };

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Center h={300}>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xs">
        Audit Logs
      </Title>
      <Text c="dimmed" mb="xl">
        System-wide activity logs
      </Text>

      <Group mb="lg">
        <Select
          placeholder="Filter by action"
          data={uniqueActions}
          value={filterAction}
          onChange={setFilterAction}
          clearable={false}
          w={200}
        />
        <Select
          placeholder="Filter by type"
          data={uniqueTypes}
          value={filterType}
          onChange={setFilterType}
          clearable={false}
          w={200}
        />
      </Group>

      <Card withBorder>
        {filteredLogs.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No audit logs found.
          </Text>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Timestamp</Table.Th>
                <Table.Th>Action</Table.Th>
                <Table.Th>Actor</Table.Th>
                <Table.Th>Target</Table.Th>
                <Table.Th>Details</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredLogs.map((log) => (
                <Table.Tr key={log.id}>
                  <Table.Td>{formatTimestamp(log.timestamp)}</Table.Td>
                  <Table.Td>
                    <Badge color={getActionColor(log.action)}>{log.action}</Badge>
                  </Table.Td>
                  <Table.Td>{log.actorEmail || log.actorUid || 'System'}</Table.Td>
                  <Table.Td>{log.targetEmail || log.entityId || '-'}</Table.Td>
                  <Table.Td>
                    {log.details
                      ? typeof log.details === 'string'
                        ? log.details
                        : JSON.stringify(log.details).slice(0, 50)
                      : '-'}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>
    </Container>
  );
}
