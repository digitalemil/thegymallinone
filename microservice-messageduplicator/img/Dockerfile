FROM centos:7
RUN yum install -y https://centos7.iuscommunity.org/ius-release.rpm
RUN yum -y update
RUN yum -y install yum install -y python36u python36u-libs python36u-devel python36u-pip
RUN rm /usr/bin/python
RUN ln -s /usr/bin/python3.6 /usr/bin/python
RUN ln -s /usr/bin/pip3.6 /usr/bin/pip
RUN pip install --upgrade pip
RUN pip install django
RUN pip install grequests
RUN pip install gunicorn
