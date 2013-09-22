# Setups.

cd ~/w
mkdir Dropbox
mkdir Dropbox/tools

# Install p4v & p4
# ~/w/Dropbox/tools/perforce

export PERFORCE_VERSION=r13.2
export P4V_VERSION=p4v-2013.2.685561

export PERFORCE_FTP_DIR=http://ftp.perforce.com/perforce/$PERFORCE_VERSION/bin.linux26x86_64
wget $PERFORCE_FTP_DIR/p4v.tgz
tar zxvf p4v.tgz
cp -r $P4V_VERSION ~/w/Dropbox/tools/perforce

wget $PERFORCE_FTP_DIR/p4
cp -r p4 ~/w/Dropbox/tools/perforce/bin

export PATH=$PATH:~/w/Dropbox/tools/perforce/bin


# Install go
mkdir ~/w/Dropbox/tools/golang
mkdir ~/w/Dropbox/tools/golang/go_1.1.1

wget "http://go.googlecode.com/files/go1.1.1.linux-amd64.tar.gz"  go1.1.1.linux-amd64.tar.gz
tar zxvf go1.1.1.linux-amd64.tar.gz
cp -r ./go ~/w/Dropbox/tools/golang/go_1.1.1

export PATH=$PATH:~/w/Dropbox/tools/golang/go_1.1.1/bin


