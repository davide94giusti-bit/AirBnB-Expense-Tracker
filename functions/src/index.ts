import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const createUserForApartment = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be logged in'
      );
    }

    const {email, role, apartmentId, tempPassword} = data;

    if (!email || !role || !apartmentId || !tempPassword) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields'
      );
    }

    try {
      const userRecord = await admin.auth().createUser({
        email: email,
        password: tempPassword,
        displayName: email.split('@')[0],
      });

      await admin.firestore().collection('users').doc(userRecord.uid).set({
        email: email,
        role: role,
        apartmentId: apartmentId,
        forcePasswordChange: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        uid: userRecord.uid,
      });

      await admin
        .firestore()
        .collection('apartments')
        .doc(apartmentId)
        .collection('members')
        .doc(userRecord.uid)
        .set({
          email: email,
          role: role,
          joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      return {
        success: true,
        uid: userRecord.uid,
        email: email,
        message: 'User created successfully',
      };
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        throw new functions.https.HttpsError(
          'already-exists',
          'User with this email already exists'
        );
      }
      throw new functions.https.HttpsError(
        'internal',
        'Error creating user: ' + error.message
      );
    }
  }
);

export const deleteUserFromApartment = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be logged in'
      );
    }

    const {uid, apartmentId} = data;

    if (!uid || !apartmentId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing uid or apartmentId'
      );
    }

    try {
      await admin.firestore().collection('users').doc(uid).delete();
      await admin
        .firestore()
        .collection('apartments')
        .doc(apartmentId)
        .collection('members')
        .doc(uid)
        .delete();

      await admin.auth().deleteUser(uid);

      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error: any) {
      throw new functions.https.HttpsError(
        'internal',
        'Error deleting user: ' + error.message
      );
    }
  }
);
