import express, { Request, Response } from 'express';
import {
  createGroup,
  getAllGroups,
  getGroupById,
  getGroupsForUser,
  addUserToGroup,
  removeUserFromGroup,
  getGroupMembers,
  isUserInGroup
} from '../models/groups';

const router = express.Router();

// Get all groups
router.get('/', async (req: Request, res: Response) => {
  try {
    const groups = await getAllGroups();
    return res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Get groups for a specific user
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const groups = await getGroupsForUser(userId);
    return res.json(groups);
  } catch (error) {
    console.error('Error fetching user groups:', error);
    return res.status(500).json({ error: 'Failed to fetch user groups' });
  }
});

// Get a specific group
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    const group = await getGroupById(id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    return res.json(group);
  } catch (error) {
    console.error('Error fetching group:', error);
    return res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// Create a new group
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, created_by } = req.body;

    if (!name || !created_by) {
      return res.status(400).json({ error: 'Name and created_by are required' });
    }

    const groupId = await createGroup(name, description || null, created_by);

    // Add creator as first member
    await addUserToGroup(groupId, created_by);

    return res.status(201).json({ id: groupId, message: 'Group created successfully' });
  } catch (error) {
    console.error('Error creating group:', error);
    return res.status(500).json({ error: 'Failed to create group' });
  }
});

// Join a group
router.post('/:id/join', async (req: Request, res: Response) => {
  try {
    const groupId = parseInt(req.params.id);
    const { userId } = req.body;

    if (isNaN(groupId) || !userId) {
      return res.status(400).json({ error: 'Invalid group ID or user ID' });
    }

    // Check if group exists
    const group = await getGroupById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is already a member
    const isMember = await isUserInGroup(groupId, userId);
    if (isMember) {
      return res.status(400).json({ error: 'User is already a member of this group' });
    }

    await addUserToGroup(groupId, userId);
    return res.json({ message: 'Successfully joined group' });
  } catch (error) {
    console.error('Error joining group:', error);
    return res.status(500).json({ error: 'Failed to join group' });
  }
});

// Leave a group
router.post('/:id/leave', async (req: Request, res: Response) => {
  try {
    const groupId = parseInt(req.params.id);
    const { userId } = req.body;

    if (isNaN(groupId) || !userId) {
      return res.status(400).json({ error: 'Invalid group ID or user ID' });
    }

    // Check if group exists
    const group = await getGroupById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is a member
    const isMember = await isUserInGroup(groupId, userId);
    if (!isMember) {
      return res.status(400).json({ error: 'User is not a member of this group' });
    }

    await removeUserFromGroup(groupId, userId);
    return res.json({ message: 'Successfully left group' });
  } catch (error) {
    console.error('Error leaving group:', error);
    return res.status(500).json({ error: 'Failed to leave group' });
  }
});

// Get group members
router.get('/:id/members', async (req: Request, res: Response) => {
  try {
    const groupId = parseInt(req.params.id);
    if (isNaN(groupId)) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    // Check if group exists
    const group = await getGroupById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const members = await getGroupMembers(groupId);
    return res.json(members);
  } catch (error) {
    console.error('Error fetching group members:', error);
    return res.status(500).json({ error: 'Failed to fetch group members' });
  }
});

export default router;
