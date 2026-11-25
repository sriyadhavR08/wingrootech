import os
import sys
import zipfile

def make_posix_zip(source_dir, output_zip_path):
    source_dir = os.path.abspath(source_dir)
    output_zip_path = os.path.abspath(output_zip_path)

    if not os.path.exists(source_dir):
        print(f"[ERROR] Source directory does not exist: {source_dir}")
        return False

    if os.path.exists(output_zip_path):
        try:
            os.remove(output_zip_path)
        except Exception as e:
            print(f"[WARNING] Could not remove existing zip {output_zip_path}: {e}")

    count = 0
    with zipfile.ZipFile(output_zip_path, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(source_dir):
            # Exclude unwanted directories
            dirs[:] = [
                d for d in dirs
                if d not in ('__pycache__', '.pytest_cache', '.git', '.idea', 'instance', 'uploads', '.vscode')
            ]
            for file in files:
                # Exclude unwanted files
                if file.endswith(('.pyc', '.pyo', '.log')) or file in ('.env', '.DS_Store', 'Thumbs.db'):
                    continue

                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, source_dir)
                
                # CRITICAL FOR AWS ELASTIC BEANSTALK / LINUX:
                # Must use forward slash '/' instead of Windows backslash '\'
                # Otherwise Linux /usr/bin/unzip fails with exit status 1:
                # "warning: appears to use backslashes as path separators"
                arc_name = rel_path.replace('\\', '/')
                
                zf.write(full_path, arc_name)
                count += 1

    file_size_kb = os.path.getsize(output_zip_path) / 1024.0
    print(f"[SUCCESS] Packaged {count} files into '{os.path.basename(output_zip_path)}' ({file_size_kb:.1f} KB)")
    print(f"          Paths inside ZIP use POSIX forward slashes ('/') for 100% Linux/AWS EBS compatibility.")
    return True

if __name__ == '__main__':
    root_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 1. Package backend-deploy.zip
    backend_deploy_dir = os.path.join(root_dir, 'backend-deploy')
    backend_zip = os.path.join(root_dir, 'backend-deploy.zip')
    print("--- Packaging Backend for AWS Elastic Beanstalk ---")
    make_posix_zip(backend_deploy_dir, backend_zip)

    # 2. Package frontend-dist.zip
    frontend_dist_dir = os.path.join(root_dir, 'frontend-dist')
    frontend_zip = os.path.join(root_dir, 'frontend-dist.zip')
    if os.path.exists(frontend_dist_dir):
        print("\n--- Packaging Frontend Static Distribution ---")
        make_posix_zip(frontend_dist_dir, frontend_zip)
