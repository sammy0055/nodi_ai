import React, { useState, useEffect } from 'react';
import { FiMail, FiTrash2, FiCheckCircle, FiXCircle, FiClock, FiSend, FiSave, FiX } from 'react-icons/fi';
import Button from '../../components/atoms/Button/Button';
import { useLoaderData } from 'react-router';
import { AdminOrganziationService } from '../../services/admin/AdminOrganizationService';

export interface NotificationEmail {
  id?: string | null;
  email: string;
  status: 'verified' | 'pending';
  verificationCode?: string | null;
  codeExpiresAt?: Date | null;
  createdAt: Date;
}

const EmailSettingsPage: React.FC = () => {
  const data = useLoaderData();
  const [emails, setEmails] = useState<NotificationEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingEmail, setAddingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [currentEmailId, setCurrentEmailId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingEmailId, setEditingEmailId] = useState<string | null>(null);
  const [editEmailValue, setEditEmailValue] = useState('');

  //   const emailService = EmailSettingsService.getInstance();
  const { addNotificationEmail, verifyNotificationEmail, deleteAdminNotificationEmail } =
    new AdminOrganziationService();
  // Load emails on component mount
  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async () => {
    try {
      setLoading(true);
      setEmails(data);
    } catch (err) {
      setError('Failed to load emails');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmail = async () => {
    if (!newEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const result = await addNotificationEmail(newEmail.trim());
      setVerificationStep(true);
      setCurrentEmailId(result.data.id || null);
      setSuccess(`Verification code sent to ${newEmail}`);
    } catch (err: any) {
      setError(err.message || 'Failed to add email');
    }
  };

  const handleVerifyEmail = async () => {
    if (!currentEmailId || !verificationToken.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const data = await verifyNotificationEmail(currentEmailId, verificationToken.trim());

      setEmails((prev) => [...prev, data.data]);
      setSuccess('Email verified successfully!');
      setVerificationStep(false);
      setNewEmail('');
      setVerificationToken('');
      setCurrentEmailId(null);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    }
  };

  const handleDeleteEmail = async (emailId: string) => {
    setError(null);
    setSuccess(null);

    try {
      await deleteAdminNotificationEmail(emailId);
      const newEmails = emails.filter((e) => e.id !== emailId);
      setEmails(newEmails);
      setSuccess('Email deleted successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to delete email');
    }
  };

  //   const handleResendVerification = async (emailId: string, emailAddress: string) => {
  //     setError(null);
  //     setSuccess(null);

  //     try {
  //         const result = await emailService.resendVerification(emailId);
  //         if (result.success) {
  //           setSuccess(`New verification code sent to ${emailAddress}`);
  //           setCurrentEmailId(emailId);
  //           setVerificationStep(true);
  //         } else {
  //           setError(result.error || 'Failed to resend verification');
  //         }
  //     } catch (err) {
  //       setError('Failed to resend verification');
  //     }
  //   };

  //   const startEditEmail = (email: NotificationEmail) => {
  //     if (!email.id) {
  //       setError('invalid email');
  //       return;
  //     }
  //     setEditingEmailId(email.id);
  //     setEditEmailValue(email.email);
  //     setError(null);
  //     setSuccess(null);
  //   };

  const cancelEditEmail = () => {
    setEditingEmailId(null);
    setEditEmailValue('');
  };

  //   const saveEditEmail = async () => {
  //     if (!editingEmailId || !editEmailValue.trim()) {
  //       setError('Please enter a valid email');
  //       return;
  //     }

  //     // For simplicity, we'll simulate update by deleting old and adding new
  //     // In real app, you'd have an update endpoint
  //     try {
  //       await emailService.deleteEmail(editingEmailId);
  //       const result = await emailService.addEmail(editEmailValue.trim());

  //       if (result.success) {
  //         setSuccess('Email updated successfully. Please verify the new email address.');
  //         setEditingEmailId(null);
  //         setEditEmailValue('');
  //         setVerificationStep(true);
  //         setCurrentEmailId(emails[emails.length - 1]?.id || null);
  //         await loadEmails();
  //       } else {
  //         setError(result.error || 'Failed to update email');
  //         // Reload to restore original state
  //         await loadEmails();
  //       }
  //     } catch (err) {
  //       setError('Failed to update email');
  //       await loadEmails();
  //     }
  //   };

  const cancelAddEmail = () => {
    setAddingEmail(false);
    setNewEmail('');
    setError(null);
    setVerificationStep(false);
    setVerificationToken('');
  };

  const getStatusIcon = (status: NotificationEmail['status']) => {
    switch (status) {
      case 'verified':
        return <FiCheckCircle className="text-green-600" />;
      case 'pending':
        return <FiClock className="text-yellow-600" />;
      default:
        return <FiClock className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: NotificationEmail['status']) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6 p-4 md:p-0 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Notification Settings</h2>
          <p className="text-neutral-600 mt-1">Manage email addresses for receiving notifications</p>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <FiXCircle className="text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <FiCheckCircle className="text-green-600 mr-2" />
            <p className="text-green-800">{success}</p>
          </div>
        </div>
      )}

      {/* Add Email Section */}
      <div className="bg-white rounded-lg shadow-medium p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Add Email Address</h3>

        {!addingEmail && !verificationStep ? (
          <div className="flex space-x-3">
            <div className="flex-1">
              <input
                type="email"
                placeholder="Enter email address"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
              />
            </div>
            <Button onClick={() => setAddingEmail(true)}>
              <FiMail className="mr-2" />
              Add Email
            </Button>
          </div>
        ) : verificationStep ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <FiSend className="text-blue-600 mr-2" />
                <p className="text-blue-800">
                  We've sent a verification code to <strong>{newEmail}</strong>. Please check your inbox and enter the
                  code below.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Enter verification code"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={verificationToken}
                  onChange={(e) => setVerificationToken(e.target.value.toUpperCase())}
                  maxLength={6}
                />
                <p className="text-sm text-neutral-500 mt-1">Enter the 6-digit code sent to your email</p>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleVerifyEmail}>
                  <FiCheckCircle className="mr-2" />
                  Verify
                </Button>
                <Button variant="outline" onClick={cancelAddEmail}>
                  <FiX className="mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="flex-1">
              <input
                type="email"
                placeholder="Enter email address"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleAddEmail} disabled={!newEmail.trim()}>
                <FiSend className="mr-2" />
                Send Verification
              </Button>
              <Button variant="outline" onClick={cancelAddEmail}>
                <FiX className="mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Email List */}
      <div className="bg-white rounded-lg shadow-medium overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
          <h3 className="text-lg font-semibold text-neutral-900">Notification Emails ({emails.length})</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-neutral-500 mt-2">Loading emails...</p>
          </div>
        ) : emails.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            <FiMail className="mx-auto text-4xl text-neutral-300 mb-3" />
            <p>No email addresses configured</p>
            <p className="text-sm mt-1">Add an email address to receive notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {emails.map((email) => (
              <div key={email.id} className="p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      {editingEmailId === email.id ? (
                        <input
                          type="email"
                          className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          value={editEmailValue}
                          onChange={(e) => setEditEmailValue(e.target.value)}
                        />
                      ) : (
                        <>
                          <div className="flex-shrink-0">{getStatusIcon(email.status)}</div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-neutral-900">{email.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  email.status
                                )}`}
                              >
                                {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                              </span>
                              <span className="text-xs text-neutral-500">Added {formatDate(email.createdAt)}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {editingEmailId === email.id ? (
                      <>
                        <Button size="sm" onClick={() => ''} disabled={!editEmailValue.trim()}>
                          <FiSave className="mr-1" />
                          Save
                        </Button>
                        <Button variant="outline" size="sm" onClick={cancelEditEmail}>
                          <FiX className="mr-1" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        {/* {email.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResendVerification(email.id!, email.email)}
                          >
                            <FiSend className="mr-1" />
                            Resend Code
                          </Button>
                        )} */}
                        {/* <Button variant="outline" size="sm" onClick={() => startEditEmail(email)}>
                          <FiEdit className="mr-1" />
                          Edit
                        </Button> */}
                        <Button variant="danger" size="sm" onClick={() => handleDeleteEmail(email.id!)}>
                          <FiTrash2 className="mr-1" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-2">How it works</h4>
        <ul className="text-blue-800 space-y-2 text-sm">
          <li className="flex items-start">
            <FiCheckCircle className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <span>Add email addresses where you want to receive notifications</span>
          </li>
          <li className="flex items-start">
            <FiCheckCircle className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <span>Each email must be verified before it can receive notifications</span>
          </li>
          <li className="flex items-start">
            <FiCheckCircle className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <span>Verification codes are sent to the email address and expire after 24 hours</span>
          </li>
          <li className="flex items-start">
            <FiCheckCircle className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <span>You can resend verification codes if needed</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default EmailSettingsPage;
