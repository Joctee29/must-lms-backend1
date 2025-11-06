# Rebuild Student System - Quick Guide

## What Changed

Fixed 403 authorization errors by adding proper query parameters to API calls in the student system.

## Files Modified

1. `student-system/src/components/Dashboard.tsx`
2. `student-system/src/pages/Index.tsx`
3. `student-system/src/pages/TakeAssessment.tsx`
4. `student-system/src/pages/StudentLiveClass.tsx`

## Rebuild Instructions

### Option 1: Rebuild Student System Only

```bash
cd student-system
npm run build
```

The build output will be in `student-system/dist/`

### Option 2: Rebuild All Systems

```bash
# From project root
cd admin-system
npm run build

cd ../lecture-system
npm run build

cd ../student-system
npm run build
```

### Option 3: Development Mode (Testing)

```bash
cd student-system
npm run dev
```

This will start the development server at `http://localhost:5173` (or similar port)

## Deployment

### If Using Static Hosting (Netlify, Vercel, etc.)

1. Build the student system:
   ```bash
   cd student-system
   npm run build
   ```

2. Deploy the `student-system/dist/` folder to your hosting service

### If Using Docker

Rebuild the Docker image:
```bash
docker-compose build student-system
docker-compose up -d student-system
```

### If Using Kubernetes

Update the deployment:
```bash
kubectl apply -f kubernetes/student-deployment.yaml
kubectl rollout restart deployment/student-system
```

## Verification

After rebuilding and deploying, verify the fix:

1. **Open browser console** (F12)
2. **Login as a student** (e.g., registration: 24100523140076)
3. **Check console logs** - Should see:
   ```
   ✅ Programs API Response: { success: true, data: [Array] }
   ✅ Student Programs Found: [Array with programs]
   ✅ Assignments API Response: { success: true, data: [Array] }
   ```

4. **Verify NO 403 errors**:
   - No "Failed to load resource: 403" messages
   - No "Unauthorized" errors

5. **Check dashboard displays**:
   - Programs show up in "My Programs" section
   - Assignments count is correct
   - Materials page shows content
   - Assessments page shows available tests

## Troubleshooting

### Issue: Still seeing 403 errors

**Solution**: Clear browser cache and hard reload (Ctrl+Shift+R)

### Issue: Empty data arrays

**Check**: 
- Student has enrolled programs in database
- Programs have correct `course_id` matching student's course
- Backend is running and accessible

### Issue: Build fails

**Solution**:
```bash
cd student-system
rm -rf node_modules
npm install
npm run build
```

### Issue: TypeScript errors

**Solution**: The changes are JavaScript-compatible. If TypeScript complains:
```bash
npm run build -- --mode production
```

## Backend Compatibility

✅ **No backend changes required** - The backend already supports these query parameters.

The fix uses existing backend authorization logic:
- `user_type=student` - Identifies the user as a student
- `student_id={id}` - Provides the student's database ID

## Performance Impact

**Positive Impact**:
- Reduced data transfer (backend filters before sending)
- Faster page loads
- Less client-side processing

**No Negative Impact**:
- Query parameters add minimal overhead
- Backend already had this logic implemented

## Rollback Plan

If issues occur, revert the changes:

```bash
git checkout HEAD~1 student-system/src/components/Dashboard.tsx
git checkout HEAD~1 student-system/src/pages/Index.tsx
git checkout HEAD~1 student-system/src/pages/TakeAssessment.tsx
git checkout HEAD~1 student-system/src/pages/StudentLiveClass.tsx
npm run build
```

## Next Steps

1. ✅ Rebuild student system
2. ✅ Deploy to production
3. ✅ Test with real student accounts
4. ✅ Monitor console for any remaining errors
5. ✅ Update documentation if needed

## Support

If you encounter issues:
1. Check console logs for specific error messages
2. Verify backend is running: `https://must-lms-backend.onrender.com/api/health`
3. Test API endpoints directly in browser/Postman
4. Review `AUTHORIZATION_FIX_SUMMARY.md` for detailed explanation
