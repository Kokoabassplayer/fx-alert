"use client"

import { format } from 'date-fns';
import { Bell, BellOff, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { RateAlert } from '@/lib/alerts-types';

interface AlertListProps {
  alerts: RateAlert[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  currentRates?: Record<string, number>;
}

export function AlertList({ alerts, onToggle, onDelete, currentRates }: AlertListProps) {
  if (alerts.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <Bell className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-foreground mb-1">No alerts set up</h3>
        <p className="text-xs text-muted-foreground">
          Create your first alert to get notified when rates hit your target.
        </p>
      </div>
    );
  }

  const getRateKey = (from: string, to: string) => `${from}/${to}`;

  return (
    <div className="space-y-2">
      {alerts.map((alert) => {
        const rateKey = getRateKey(alert.fromCurrency, alert.toCurrency);
        const currentRate = currentRates?.[rateKey];
        const isTriggered = alert.triggeredAt && new Date(alert.triggeredAt) > new Date(Date.now() - 60000);

        return (
          <div
            key={alert.id}
            className={`p-3 rounded-lg border transition-colors ${
              !alert.active
                ? 'bg-muted/30 opacity-60'
                : isTriggered
                  ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900'
                  : 'bg-card/50 border-border/50'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              {/* Alert Info */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  !alert.active
                    ? 'bg-muted'
                    : alert.condition === 'above'
                      ? 'bg-green-500/10'
                      : 'bg-amber-500/10'
                }`}>
                  {isTriggered ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : !alert.active ? (
                    <BellOff className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Bell className={`w-5 h-5 ${alert.condition === 'above' ? 'text-green-600' : 'text-amber-600'}`} />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {alert.fromCurrency}/{alert.toCurrency}{' '}
                    <span className={alert.condition === 'above' ? 'text-green-600' : 'text-amber-600'}>
                      {alert.condition}
                    </span>{' '}
                    {alert.threshold.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {alert.condition === 'above'
                      ? `Notify when rate exceeds ${alert.threshold.toFixed(2)}`
                      : `Notify when rate drops below ${alert.threshold.toFixed(2)}`}
                  </p>

                  {/* Current Rate Display */}
                  {currentRate !== undefined && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Current: <span className="font-medium text-foreground">{currentRate.toFixed(2)}</span>
                      {alert.condition === 'above' && currentRate > alert.threshold && (
                        <span className="ml-1 text-green-600">(Above target!)</span>
                      )}
                      {alert.condition === 'below' && currentRate < alert.threshold && (
                        <span className="ml-1 text-green-600">(Below target!)</span>
                      )}
                    </p>
                  )}

                  {/* Created Date */}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Created {format(new Date(alert.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Active Toggle */}
                <button
                  onClick={() => onToggle(alert.id)}
                  className="p-1.5 rounded hover:bg-muted transition-colors"
                  title={alert.active ? 'Disable alert' : 'Enable alert'}
                >
                  {alert.active ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>

                {/* Delete */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Alert?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this alert? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(alert.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
