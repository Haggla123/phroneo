import express from 'express';
import Story from '../models/Story.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();
const languages = ['de', 'en'];

function normalizeStory(input = {}) {
  const localized = (value, limit) => Object.fromEntries(languages.map((language) => [
    language,
    String(value?.[language] || '').trim().slice(0, limit)
  ]));
  return {
    displayName: String(input.displayName || '').trim().slice(0, 120),
    role: localized(input.role, 180),
    program: localized(input.program, 120),
    quote: localized(input.quote, 3000),
    publicationConsent: input.publicationConsent === true,
    published: input.published === true
  };
}

function validateStory(story) {
  if (!story.displayName) return 'Add a display name (an approved anonymous label is fine).';
  if (!story.quote.de || !story.quote.en) return 'Add the story text in German and English.';
  if (!story.publicationConsent) return 'Confirm that permission to publish this story has been recorded.';
  return null;
}

router.get('/', async (req, res) => {
  try {
    const stories = await Story.find({ published: true }).sort({ createdAt: -1 }).lean();
    res.json(stories);
  } catch (error) {
    console.error('Published stories read failed:', error.message);
    res.status(500).json({ message: 'Unable to load stories' });
  }
});

router.get('/admin', auth, async (req, res) => {
  try {
    res.json(await Story.find().sort({ updatedAt: -1 }).lean());
  } catch (error) {
    console.error('Admin stories read failed:', error.message);
    res.status(500).json({ message: 'Unable to load stories' });
  }
});

router.post('/', auth, async (req, res) => {
  const story = normalizeStory(req.body);
  const validationError = validateStory(story);
  if (validationError) return res.status(400).json({ message: validationError });
  try {
    res.status(201).json(await Story.create(story));
  } catch (error) {
    console.error('Story create failed:', error.message);
    res.status(500).json({ message: 'Unable to save story' });
  }
});

router.put('/:id', auth, async (req, res) => {
  const story = normalizeStory(req.body);
  const validationError = validateStory(story);
  if (validationError) return res.status(400).json({ message: validationError });
  try {
    const saved = await Story.findByIdAndUpdate(req.params.id, story, { new: true, runValidators: true });
    if (!saved) return res.status(404).json({ message: 'Story not found' });
    res.json(saved);
  } catch (error) {
    console.error('Story update failed:', error.message);
    res.status(400).json({ message: 'Unable to update story' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Story.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Story not found' });
    res.json({ message: 'Story deleted' });
  } catch (error) {
    console.error('Story delete failed:', error.message);
    res.status(500).json({ message: 'Unable to delete story' });
  }
});

export default router;
