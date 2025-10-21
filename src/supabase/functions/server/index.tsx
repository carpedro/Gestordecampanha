import { Hono } from 'npm:hono@4.6.14';
import { cors } from 'npm:hono@4.6.14/cors';
import { logger } from 'npm:hono@4.6.14/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const BUCKET_NAME = 'make-a1f709fc-attachments';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Supabase client for server-side operations
const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
};

const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
  );
};

// Default system user for open access
const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

// Helper to get default user (no auth required)
async function getDefaultUser() {
  const supabase = getSupabaseAdmin();
  
  // Try to get existing system user
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', SYSTEM_USER_ID)
    .single();
  
  if (existingUser) {
    return existingUser;
  }
  
  // Create system user if it doesn't exist
  const { data: newUser } = await supabase
    .from('users')
    .insert({
      id: SYSTEM_USER_ID,
      email: 'system@campanhas-edtech.app',
      name: 'Sistema',
      role: 'admin',
      position: 'Sistema',
    })
    .select()
    .single();
  
  return newUser || {
    id: SYSTEM_USER_ID,
    email: 'system@campanhas-edtech.app',
    name: 'Sistema',
    role: 'admin',
    position: 'Sistema',
  };
}

// Helper to create slug
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Helper to record edit history
async function recordEdit(campaignId: string, userId: string, action: string, fieldChanged?: string, oldValue?: any, newValue?: any) {
  const supabase = getSupabaseAdmin();
  
  await supabase.from('campaign_audit').insert({
    campaign_id: campaignId,
    user_id: userId,
    action,
    field_changed: fieldChanged,
    old_value: oldValue,
    new_value: newValue,
  });
}

// ============ AUTH ROUTES ============

// Get profile
app.get('/make-server-a1f709fc/auth/profile', async (c) => {
  try {
    const user = await getDefaultUser();
    
    return c.json(user);
  } catch (error) {
    console.error('Error getting profile:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Update profile
app.put('/make-server-a1f709fc/auth/profile', async (c) => {
  try {
    const user = await getDefaultUser();
    
    const updates = await c.req.json();
    const supabase = getSupabaseAdmin();
    
    const { data: updated, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating profile:', error);
      return c.json({ error: error.message }, 500);
    }
    
    return c.json(updated);
  } catch (error) {
    console.error('Error updating profile:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============ CAMPAIGN ROUTES ============

// Get all campaigns
app.get('/make-server-a1f709fc/campaigns', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        institution:institutions(name),
        tags:campaign_tags(tag:tags(name))
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching campaigns:', error);
      return c.json({ error: error.message }, 500);
    }
    
    return c.json({ campaigns });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get campaign by slug
app.get('/make-server-a1f709fc/campaigns/slug/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    const supabase = getSupabaseAdmin();
    
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        institution:institutions(name),
        tags:campaign_tags(tag:tags(name))
      `)
      .eq('slug', slug)
      .single();
    
    if (error || !campaign) {
      return c.json({ error: 'Campaign not found' }, 404);
    }
    
    // Record view (skip for now)
    // const user = await getDefaultUser();
    // await supabase.from('campaign_views').insert({
    //   campaign_id: campaign.id,
    //   user_id: user.id,
    // });
    
    return c.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Create campaign
app.post('/make-server-a1f709fc/campaigns', async (c) => {
  try {
    const user = await getDefaultUser();
    const body = await c.req.json();
    const supabase = getSupabaseAdmin();
    
    // Generate slug
    const slug = slugify(body.name);
    
    // Get institution ID from name
    const { data: institution, error: instError } = await supabase
      .from('institutions')
      .select('id')
      .eq('name', body.institution)
      .single();
    
    if (!institution) {
      console.error('Institution not found:', body.institution, instError);
      return c.json({ 
        error: `🏫 Instituição "${body.institution}" não encontrada. Execute /EXECUTE_NOW.sql no Supabase para criar as instituições. Veja /INSTITUTION_ERROR_FIX.md`,
        errorCode: 'INSTITUTION_NOT_FOUND',
        institutionRequested: body.institution
      }, 400);
    }
    
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        name: body.name,
        slug,
        institution_id: institution.id,
        description: body.description,
        audio_url: body.audioUrl,
        start_date: body.startDate,
        end_date: body.endDate,
        status: body.status || 'draft',
        created_by_user_id: SYSTEM_USER_ID,
        assigned_to_user_id: SYSTEM_USER_ID,
      })
      .select(`
        *,
        institution:institutions(name)
      `)
      .single();
    
    if (error) {
      console.error('Error creating campaign:', error);
      
      // Detectar erro de usuário sistema não criado
      if (error.code === '23503' && error.message.includes('created_by_user_id')) {
        return c.json({ 
          error: '🚨 CONFIGURAÇÃO NECESSÁRIA: O usuário sistema ainda não foi criado no banco de dados. Execute o arquivo /EXECUTE_NOW.sql no Supabase SQL Editor. Veja /START_HERE.md para instruções passo a passo.',
          errorCode: 'SYSTEM_USER_NOT_CREATED',
          instructions: 'https://supabase.com/dashboard → SQL Editor → Execute /EXECUTE_NOW.sql'
        }, 500);
      }
      
      return c.json({ error: error.message }, 500);
    }
    
    // Add tags if provided
    if (body.tagsRelated && body.tagsRelated.length > 0) {
      const tagInserts = body.tagsRelated.map((tagId: string) => ({
        campaign_id: campaign.id,
        tag_id: tagId,
        relation_type: 'related',
      }));
      await supabase.from('campaign_tags').insert(tagInserts);
    }
    
    if (body.tagsExcluded && body.tagsExcluded.length > 0) {
      const tagInserts = body.tagsExcluded.map((tagId: string) => ({
        campaign_id: campaign.id,
        tag_id: tagId,
        relation_type: 'excluded',
      }));
      await supabase.from('campaign_tags').insert(tagInserts);
    }
    
    // Record history (skip for now)
    // await recordEdit(campaign.id, user.id, 'created');
    
    return c.json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Update campaign
app.put('/make-server-a1f709fc/campaigns/:id', async (c) => {
  try {
    const user = await getDefaultUser();
    const id = c.req.param('id');
    const body = await c.req.json();
    const supabase = getSupabaseAdmin();
    
    // Get existing campaign
    const { data: existing } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();
    
    if (!existing) {
      return c.json({ error: 'Campaign not found' }, 404);
    }
    
    // Generate new slug if name changed
    const slug = body.name && body.name !== existing.name ? slugify(body.name) : existing.slug;
    
    // Get institution ID from name
    const { data: institution, error: instError } = await supabase
      .from('institutions')
      .select('id')
      .eq('name', body.institution)
      .single();
    
    if (!institution) {
      console.error('Institution not found:', body.institution, instError);
      return c.json({ 
        error: `🏫 Instituição "${body.institution}" não encontrada. Execute /EXECUTE_NOW.sql no Supabase para criar as instituições. Veja /INSTITUTION_ERROR_FIX.md`,
        errorCode: 'INSTITUTION_NOT_FOUND',
        institutionRequested: body.institution
      }, 400);
    }
    
    const { data: updated, error } = await supabase
      .from('campaigns')
      .update({
        name: body.name,
        slug,
        institution_id: institution.id,
        description: body.description,
        audio_url: body.audioUrl,
        start_date: body.startDate,
        end_date: body.endDate,
        status: body.status,
      })
      .eq('id', id)
      .select(`
        *,
        institution:institutions(name)
      `)
      .single();
    
    if (error) {
      console.error('Error updating campaign:', error);
      return c.json({ error: error.message }, 500);
    }
    
    // Record history for changed fields (skip for now)
    // for (const key of Object.keys(body)) {
    //   if (JSON.stringify(existing[key]) !== JSON.stringify(body[key])) {
    //     await recordEdit(id, user.id, 'edited', key, existing[key], body[key]);
    //   }
    // }
    
    return c.json(updated);
  } catch (error) {
    console.error('Error updating campaign:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Update campaign status
app.put('/make-server-a1f709fc/campaigns/:id/status', async (c) => {
  try {
    const user = await getDefaultUser();
    
    const id = c.req.param('id');
    const { status } = await c.req.json();
    const supabase = getSupabaseAdmin();
    
    // Get existing status
    const { data: existing } = await supabase
      .from('campaigns')
      .select('status')
      .eq('id', id)
      .single();
    
    if (!existing) {
      return c.json({ error: 'Campaign not found' }, 404);
    }
    
    const { data: updated, error } = await supabase
      .from('campaigns')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating campaign status:', error);
      return c.json({ error: error.message }, 500);
    }
    
    // await recordEdit(id, user.id, 'status_changed', 'status', existing.status, status);
    
    return c.json(updated);
  } catch (error) {
    console.error('Error updating campaign status:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Duplicate campaign
app.post('/make-server-a1f709fc/campaigns/:id/duplicate', async (c) => {
  try {
    const user = await getDefaultUser();
    const sourceId = c.req.param('id');
    const supabase = getSupabaseAdmin();
    
    const { data: source } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', sourceId)
      .single();
    
    if (!source) {
      return c.json({ error: 'Campaign not found' }, 404);
    }
    
    const newName = `${source.name} (Cópia)`;
    const newSlug = slugify(newName);
    
    const { data: duplicated, error } = await supabase
      .from('campaigns')
      .insert({
        name: newName,
        slug: newSlug,
        institution_id: source.institution_id,
        description: source.description,
        start_date: source.start_date,
        end_date: source.end_date,
        status: 'draft',
        created_by_user_id: SYSTEM_USER_ID,
        assigned_to_user_id: SYSTEM_USER_ID,
      })
      .select(`
        *,
        institution:institutions(name)
      `)
      .single();
    
    if (error) {
      console.error('Error duplicating campaign:', error);
      return c.json({ error: error.message }, 500);
    }
    
    // Copy tags
    const { data: tags } = await supabase
      .from('campaign_tags')
      .select('*')
      .eq('campaign_id', sourceId);
    
    if (tags && tags.length > 0) {
      const tagInserts = tags.map(tag => ({
        campaign_id: duplicated.id,
        tag_id: tag.tag_id,
        relation_type: tag.relation_type,
      }));
      await supabase.from('campaign_tags').insert(tagInserts);
    }
    
    // await recordEdit(duplicated.id, user.id, 'created');
    
    return c.json(duplicated);
  } catch (error) {
    console.error('Error duplicating campaign:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Delete campaign
app.delete('/make-server-a1f709fc/campaigns/:id', async (c) => {
  try {
    const user = await getDefaultUser();
    
    const id = c.req.param('id');
    const supabase = getSupabaseAdmin();
    
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting campaign:', error);
      return c.json({ error: error.message }, 500);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============ COMMENT ROUTES ============

// Get comments for campaign
app.get('/make-server-a1f709fc/campaigns/:id/comments', async (c) => {
  try {
    
    const campaignId = c.req.param('id');
    const supabase = getSupabaseAdmin();
    
    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching comments:', error);
      return c.json({ error: error.message }, 500);
    }
    
    return c.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Create comment
app.post('/make-server-a1f709fc/campaigns/:id/comments', async (c) => {
  try {
    const user = await getDefaultUser();
    
    const campaignId = c.req.param('id');
    const { content, parentId, mentions, attachments } = await c.req.json();
    const supabase = getSupabaseAdmin();
    
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        campaign_id: campaignId,
        content,
        parent_id: parentId,
        mentions: mentions || [],
        attachments: attachments || [],
        user_id: SYSTEM_USER_ID,
      })
      .select('*')
      .single();
    
    if (error) {
      console.error('Error creating comment:', error);
      
      // Detectar erro de usuário sistema não criado
      if (error.code === '23503' && error.message.includes('user_id')) {
        return c.json({ 
          error: '🚨 CONFIGURAÇÃO NECESSÁRIA: Execute o arquivo /EXECUTE_NOW.sql no Supabase SQL Editor. Veja /START_HERE.md para instruções.',
          errorCode: 'SYSTEM_USER_NOT_CREATED'
        }, 500);
      }
      
      return c.json({ error: error.message }, 500);
    }
    
    return c.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Update comment
app.put('/make-server-a1f709fc/comments/:id', async (c) => {
  try {
    const user = await getDefaultUser();
    
    const commentId = c.req.param('id');
    const { content } = await c.req.json();
    const supabase = getSupabaseAdmin();
    
    const { data: updated, error } = await supabase
      .from('comments')
      .update({ 
        content,
        edited_at: new Date().toISOString(),
      })
      .eq('id', commentId)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error updating comment:', error);
      return c.json({ error: error.message }, 500);
    }
    
    if (!updated) {
      return c.json({ error: 'Comment not found or unauthorized' }, 404);
    }
    
    return c.json(updated);
  } catch (error) {
    console.error('Error updating comment:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Delete comment
app.delete('/make-server-a1f709fc/comments/:id', async (c) => {
  try {
    const user = await getDefaultUser();
    
    const commentId = c.req.param('id');
    const supabase = getSupabaseAdmin();
    
    // Check if comment exists
    const { data: comment } = await supabase
      .from('comments')
      .select('id')
      .eq('id', commentId)
      .single();
    
    if (!comment) {
      return c.json({ error: 'Comment not found' }, 404);
    }
    
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);
    
    if (error) {
      console.error('Error deleting comment:', error);
      return c.json({ error: error.message }, 500);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Toggle important
app.post('/make-server-a1f709fc/comments/:id/important', async (c) => {
  try {
    const commentId = c.req.param('id');
    const supabase = getSupabaseAdmin();
    
    // Get current state
    const { data: comment } = await supabase
      .from('comments')
      .select('is_important')
      .eq('id', commentId)
      .single();
    
    if (!comment) {
      return c.json({ error: 'Comment not found' }, 404);
    }
    
    const { data: updated, error } = await supabase
      .from('comments')
      .update({ is_important: !comment.is_important })
      .eq('id', commentId)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error toggling important:', error);
      return c.json({ error: error.message }, 500);
    }
    
    return c.json(updated);
  } catch (error) {
    console.error('Error toggling important:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============ HISTORY ROUTES ============

// Get edit history
app.get('/make-server-a1f709fc/campaigns/:id/history', async (c) => {
  try {
    const campaignId = c.req.param('id');
    const supabase = getSupabaseAdmin();
    
    const { data: history, error } = await supabase
      .from('campaign_audit')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching history:', error);
      return c.json({ error: error.message }, 500);
    }
    
    return c.json({ history });
  } catch (error) {
    console.error('Error fetching history:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============ ATTACHMENT ROUTES ============

// Initialize storage bucket on startup
(async () => {
  try {
    const supabase = getSupabaseAdmin();
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: 104857600, // 100MB
      });
      console.log(`Created bucket: ${BUCKET_NAME}`);
    }
  } catch (error) {
    console.error('Error initializing storage bucket:', error);
  }
})();

// Helper to determine file type
function getFileType(fileName: string, mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'spreadsheet';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'archive';
  return 'other';
}

// Upload attachment
app.post('/make-server-a1f709fc/attachments/upload', async (c) => {
  try {
    const user = await getDefaultUser();

    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const campaignId = formData.get('campaignId') as string;

    if (!file || !campaignId) {
      return c.json({ error: 'Missing file or campaignId' }, 400);
    }

    // Validate file size (100MB)
    if (file.size > 104857600) {
      return c.json({ error: 'File too large (max 100MB)' }, 400);
    }

    const supabase = getSupabaseAdmin();
    
    // Generate unique file name
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substr(2, 9);
    const extension = file.name.substring(file.name.lastIndexOf('.'));
    const storagePath = `${campaignId}/${timestamp}_${randomStr}${extension}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json({ error: 'Upload failed', details: uploadError.message }, 500);
    }

    // Create attachment record in database
    const { data: attachment, error: dbError } = await supabase
      .from('attachments')
      .insert({
        campaign_id: campaignId,
        file_name: file.name,
        file_type: getFileType(file.name, file.type),
        mime_type: file.type,
        file_size: file.size,
        storage_path: storagePath,
        uploaded_by: SYSTEM_USER_ID,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Cleanup uploaded file
      await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
      
      // Detectar erro de usuário sistema não criado
      if (dbError.code === '23503' && dbError.message.includes('uploaded_by')) {
        return c.json({ 
          error: '🚨 CONFIGURAÇÃO NECESSÁRIA: Execute o arquivo /EXECUTE_NOW.sql no Supabase SQL Editor. Veja /START_HERE.md',
          errorCode: 'SYSTEM_USER_NOT_CREATED'
        }, 500);
      }
      
      return c.json({ error: 'Failed to save attachment record' }, 500);
    }

    // Record history (skip for now)
    // await recordEdit(campaignId, user.id, 'attachment_added', 'Anexos', undefined, file.name);

    // Generate signed URL
    const { data: urlData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(storagePath, 3600); // 1 hour

    return c.json({
      ...attachment,
      url: urlData?.signedUrl,
    });
  } catch (error) {
    console.error('Error uploading attachment:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get attachments for campaign
app.get('/make-server-a1f709fc/campaigns/:id/attachments', async (c) => {
  try {
    const campaignId = c.req.param('id');
    const supabase = getSupabaseAdmin();

    const { data: attachments, error } = await supabase
      .from('attachments')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching attachments:', error);
      return c.json({ error: error.message }, 500);
    }

    // Generate signed URLs for all attachments
    const attachmentsWithUrls = await Promise.all(
      (attachments || []).map(async (attachment: any) => {
        const { data } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(attachment.storage_path, 3600);

        return {
          ...attachment,
          url: data?.signedUrl,
        };
      })
    );

    return c.json({ attachments: attachmentsWithUrls });
  } catch (error) {
    console.error('Error fetching attachments:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Delete attachment
app.delete('/make-server-a1f709fc/attachments/:id', async (c) => {
  try {
    const attachmentId = c.req.param('id');
    const supabase = getSupabaseAdmin();

    // Get attachment
    const { data: attachment } = await supabase
      .from('attachments')
      .select('*')
      .eq('id', attachmentId)
      .single();

    if (!attachment) {
      return c.json({ error: 'Attachment not found' }, 404);
    }

    // Delete from storage
    await supabase.storage.from(BUCKET_NAME).remove([attachment.storage_path]);

    // Delete from database
    const { error } = await supabase
      .from('attachments')
      .delete()
      .eq('id', attachmentId);

    if (error) {
      console.error('Error deleting attachment:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============ TAGS & INSTITUTIONS ROUTES ============

// Get all tags
app.get('/make-server-a1f709fc/tags', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data: tags, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    return c.json({ tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get all institutions
app.get('/make-server-a1f709fc/institutions', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data: institutions, error } = await supabase
      .from('institutions')
      .select('*')
      .order('name');

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    return c.json({ institutions });
  } catch (error) {
    console.error('Error fetching institutions:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get all positions
app.get('/make-server-a1f709fc/positions', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data: positions, error } = await supabase
      .from('positions')
      .select('*')
      .order('name');

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    return c.json({ positions });
  } catch (error) {
    console.error('Error fetching positions:', error);
    return c.json({ error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);
